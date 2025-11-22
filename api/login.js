export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Validasi login sederhana
    if (username === 'admin' && password === 'password123') {
      return res.status(200).json({ message: 'Login berhasil', username });
    } else {
      return res.status(401).json({ message: 'Username atau password salah' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}