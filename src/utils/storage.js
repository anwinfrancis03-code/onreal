export const mem = {};

export const K = 'onreal.v1.';

export const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return k in mem ? mem[k] : d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      mem[k] = v;
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) {
      delete mem[k];
    }
  },
};

export function readSession() {
  try {
    return localStorage.getItem(K + 'session') || sessionStorage.getItem(K + 'session') || null;
  } catch (e) {
    return mem.session || null;
  }
}

export function writeSession(id, remember) {
  try {
    localStorage.removeItem(K + 'session');
    sessionStorage.removeItem(K + 'session');
    if (id) (remember ? localStorage : sessionStorage).setItem(K + 'session', id);
  } catch (e) {
    mem.session = id;
  }
}
