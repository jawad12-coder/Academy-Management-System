import handler from '../[...path].js';

export default function overview(req, res) {
  req.query = { ...req.query, path: ['dashboard', 'overview'] };
  return handler(req, res);
}
