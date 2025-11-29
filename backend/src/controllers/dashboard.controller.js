import { getOverview } from '../services/dashboard.service.js';

export const overview = async (req, res, next) => {
  try {
    const data = await getOverview();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export default { overview };
