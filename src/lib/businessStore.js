"use client";

import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "sabi_demo_store";
const ACTIVE_USER_KEY = "sabi_active_user";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const defaultStore = {
  users: [],
  products: [],
  transactions: [],
  insights: [],
};

const starterProducts = [
  { name: "Coffee", price: 2.5, stock: 24 },
  { name: "Juice", price: 1.75, stock: 12 },
  { name: "Bread", price: 1.25, stock: 5 },
];

const uid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const readStore = () => {
  if (typeof window === "undefined") return defaultStore;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStore;

  try {
    return { ...defaultStore, ...JSON.parse(raw) };
  } catch {
    return defaultStore;
  }
};

const writeStore = (store) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("sabi-store-changed"));
};

export const getActiveUser = () => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ACTIVE_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setActiveUser = (user) => {
  window.localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
};

export const listenForStoreChanges = (callback) => {
  window.addEventListener("sabi-store-changed", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("sabi-store-changed", callback);
    window.removeEventListener("storage", callback);
  };
};

const getBestSellingProduct = (transactions) => {
  const productTotals = transactions.reduce((acc, transaction) => {
    acc[transaction.product_name] =
      (acc[transaction.product_name] || 0) + Number(transaction.quantity);
    return acc;
  }, {});

  return Object.entries(productTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "No sales yet";
};

const buildInsightMessages = ({ transactions, products, newTransaction }) => {
  const lowStock = products.filter((product) => Number(product.stock) <= 5);
  const topProduct = getBestSellingProduct(transactions);
  const messages = [];

  if (newTransaction) {
    messages.push({
      message: `${newTransaction.product_name} sold ${newTransaction.quantity} time(s). Keep tracking this product today.`,
      type: "sales",
    });
  }

  if (topProduct !== "No sales yet") {
    messages.push({
      message: `${topProduct} is your best-selling product today.`,
      type: "trend",
    });
  }

  if (lowStock[0]) {
    messages.push({
      message: `Restock ${lowStock[0].name} soon. Only ${lowStock[0].stock} left.`,
      type: "stock",
    });
  }

  return messages;
};

const mapStats = ({ products, transactions, insights }) => {
  const today = todayKey();
  const todaysTransactions = transactions.filter((item) =>
    item.created_at?.startsWith(today),
  );
  const totalSalesToday = todaysTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.total),
    0,
  );

  return {
    totalSalesToday,
    transactionCount: todaysTransactions.length,
    bestSellingProduct: getBestSellingProduct(todaysTransactions),
    estimatedProfit: totalSalesToday * 0.3,
    products,
    transactions: todaysTransactions,
    allTransactions: transactions,
    insights: insights.slice(0, 6),
  };
};

const localApi = {
  async login({ businessName, businessType }) {
    const store = readStore();
    const normalizedName = businessName.trim();
    let user = store.users.find(
      (item) => item.business_name.toLowerCase() === normalizedName.toLowerCase(),
    );

    if (!user) {
      user = {
        id: uid(),
        business_name: normalizedName,
        business_type: businessType || "Small business",
        created_at: new Date().toISOString(),
      };
      store.users.push(user);
      starterProducts.forEach((product) => {
        store.products.push({
          id: uid(),
          user_id: user.id,
          ...product,
        });
      });
      writeStore(store);
    }

    setActiveUser(user);
    return user;
  },

  async getDashboard(userId) {
    const store = readStore();
    return mapStats({
      products: store.products.filter((product) => product.user_id === userId),
      transactions: store.transactions.filter((transaction) => transaction.user_id === userId),
      insights: store.insights
        .filter((insight) => insight.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    });
  },

  async addProduct(userId, product) {
    const store = readStore();
    const existing = store.products.find(
      (item) =>
        item.user_id === userId &&
        item.name.toLowerCase() === product.name.trim().toLowerCase(),
    );

    if (existing) {
      existing.price = Number(product.price);
      existing.stock = Number(product.stock);
    } else {
      store.products.push({
        id: uid(),
        user_id: userId,
        name: product.name.trim(),
        price: Number(product.price),
        stock: Number(product.stock),
      });
    }

    writeStore(store);
  },

  async updateStock(userId, productId, stock) {
    const store = readStore();
    const product = store.products.find(
      (item) => item.user_id === userId && item.id === productId,
    );

    if (product) {
      product.stock = Number(stock);
      writeStore(store);
    }
  },

  async addTransaction(userId, sale) {
    const store = readStore();
    let product = store.products.find(
      (item) =>
        item.user_id === userId &&
        item.name.toLowerCase() === sale.productName.trim().toLowerCase(),
    );
    const quantity = Number(sale.quantity);
    const price = Number(sale.price);

    if (product && Number(product.stock) < quantity) {
      throw new Error(`Only ${product.stock} ${product.name} left in stock.`);
    }

    if (!product) {
      product = {
        id: uid(),
        user_id: userId,
        name: sale.productName.trim(),
        price,
        stock: 0,
      };
      store.products.push(product);
    } else {
      product.price = price;
      product.stock = Number(product.stock) - quantity;
    }

    const transaction = {
      id: uid(),
      user_id: userId,
      product_name: product.name,
      quantity,
      price,
      total: quantity * price,
      created_at: new Date().toISOString(),
    };

    store.transactions.push(transaction);

    const userTransactions = store.transactions.filter((item) => item.user_id === userId);
    const userProducts = store.products.filter((item) => item.user_id === userId);
    const messages = buildInsightMessages({
      transactions: userTransactions.filter((item) => item.created_at.startsWith(todayKey())),
      products: userProducts,
      newTransaction: transaction,
    });

    messages.forEach((insight) => {
      store.insights.unshift({
        id: uid(),
        user_id: userId,
        ...insight,
        created_at: new Date().toISOString(),
      });
    });

    writeStore(store);
    return transaction;
  },
};

const supabaseApi = {
  async login({ businessName, businessType }) {
    const normalizedName = businessName.trim();
    const { data: existing, error: readError } = await supabase
      .from("users")
      .select("*")
      .ilike("business_name", normalizedName)
      .maybeSingle();

    if (readError) throw readError;

    if (existing) {
      setActiveUser(existing);
      return existing;
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        business_name: normalizedName,
        business_type: businessType || "Small business",
      })
      .select()
      .single();

    if (error) throw error;

    const { error: starterError } = await supabase.from("products").insert(
      starterProducts.map((product) => ({
        user_id: data.id,
        ...product,
      })),
    );

    if (starterError) throw starterError;

    setActiveUser(data);
    return data;
  },

  async getDashboard(userId) {
    const [{ data: products, error: productError }, { data: transactions, error: transactionError }, { data: insights, error: insightError }] =
      await Promise.all([
        supabase.from("products").select("*").eq("user_id", userId).order("name"),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("insights")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    if (productError) throw productError;
    if (transactionError) throw transactionError;
    if (insightError) throw insightError;

    return mapStats({
      products: products || [],
      transactions: transactions || [],
      insights: insights || [],
    });
  },

  async addProduct(userId, product) {
    const { error } = await supabase.from("products").insert({
      user_id: userId,
      name: product.name.trim(),
      price: Number(product.price),
      stock: Number(product.stock),
    });

    if (error) throw error;
  },

  async updateStock(userId, productId, stock) {
    const { error } = await supabase
      .from("products")
      .update({ stock: Number(stock) })
      .eq("user_id", userId)
      .eq("id", productId);

    if (error) throw error;
  },

  async addTransaction(userId, sale) {
    const productName = sale.productName.trim();
    const quantity = Number(sale.quantity);
    const price = Number(sale.price);

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", productName)
      .maybeSingle();

    if (productError) throw productError;
    if (product && Number(product.stock) < quantity) {
      throw new Error(`Only ${product.stock} ${product.name} left in stock.`);
    }

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        product_name: product?.name || productName,
        quantity,
        price,
        total: quantity * price,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    if (product) {
      const { error: stockError } = await supabase
        .from("products")
        .update({ price, stock: Number(product.stock) - quantity })
        .eq("id", product.id)
        .eq("user_id", userId);

      if (stockError) throw stockError;
    } else {
      const { error: createProductError } = await supabase.from("products").insert({
        user_id: userId,
        name: productName,
        price,
        stock: 0,
      });

      if (createProductError) throw createProductError;
    }

    const dashboard = await supabaseApi.getDashboard(userId);
    const messages = buildInsightMessages({
      transactions: dashboard?.transactions || [transaction],
      products: dashboard?.products || [],
      newTransaction: transaction,
    });

    if (messages.length) {
      const { error: insightError } = await supabase.from("insights").insert(
        messages.map((insight) => ({
          user_id: userId,
          ...insight,
        })),
      );

      if (insightError) throw insightError;
    }

    return transaction;
  },
};

export const businessApi = hasSupabase ? supabaseApi : localApi;
