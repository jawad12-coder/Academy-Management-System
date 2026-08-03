import handler from '../[...path].js';

export default function feeSummary(req, res) {
  req.query = { ...req.query, path: ['dashboard', 'fee-summary'] };
  return handler(req, res);
}
