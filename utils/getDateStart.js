function getDateStart(period = "day") {
    const now = new Date();
    switch (period) {
      case "day":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "quarter": {
        const qStart = Math.floor(now.getMonth() / 3) * 3;
        return new Date(now.getFullYear(), qStart, 1);
      }
      case "year":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);   // fallback: epoch
    }
  }
  
  module.exports = { getDateStart };