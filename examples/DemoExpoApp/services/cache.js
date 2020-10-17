const cache = {
  setItem: (key, value) => {
    try {
      return Promise.resolve(localStorage.setItem(key, value));
    } catch (e) {
      return Promise.reject(e);
    }
  },

  getItem: (key) => {
    return Promise.resolve(localStorage.getItem(key));
  },

  removeItem: (key) => {
    return Promise.resolve(localStorage.removeItem(key));
  },

  clear: () => {
    return Promise.resolve(localStorage.clear());
  }
}

export default cache;