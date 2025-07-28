import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const types = ['Transfer', 'Deposit', 'Withdrawal'];
const statuses = ['Pending', 'Completed', 'Failed'];
const accounts = ['Cash', 'Bank', 'Credit Card'];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', password: '' });

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.username === "admin" && user.password === "1234") {
      navigate("/dashboard");
    } else {
      alert("Invalid credentials (use admin / 1234)");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>SmartBooks Login</h1>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    source_account: '',
    destination_account: ''
  });

  const [form, setForm] = useState({
    id: null,
    date: '',
    type: '',
    status: '',
    source_account: '',
    destination_account: '',
    amount: '',
    purpose: ''
  });

  const fetchTransactions = () => {
    const query = new URLSearchParams(filters);
    fetch(`http://localhost:5000/api/transactions?${query}`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = form.id ? "PUT" : "POST";
    const url = form.id
      ? `http://localhost:5000/api/transactions/${form.id}`
      : "http://localhost:5000/api/transactions";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw err });
        return res.json();
      })
      .then(() => {
        alert(form.id ? "Updated!" : "Added!");
        setForm({
          id: null,
          date: '',
          type: '',
          status: '',
          source_account: '',
          destination_account: '',
          amount: '',
          purpose: ''
        });
        fetchTransactions();
      })
      .catch(err => alert("Error: " + (err?.error || "Something went wrong")));
  };

  const handleEdit = (txn) => setForm({ ...txn, id: txn.id });

  const handleDelete = (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    fetch(`http://localhost:5000/api/transactions/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => fetchTransactions())
      .catch(err => alert("Delete failed: " + err));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/api/transactions_batch", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Batch uploaded!");
        fetchTransactions();
      })
      .catch(err => alert("Upload failed"));
  };

  const downloadFile = (format) => {
    const url = format === "csv"
      ? "http://localhost:5000/api/export_csv"
      : "http://localhost:5000/api/export_xlsx";

    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `SmartBooks_Transactions.${format}`;
        a.click();
      })
      .catch(() => alert("Export failed"));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>SmartBooks Dashboard</h1>

      <h2>Filter</h2>
      <div style={{ marginBottom: "10px" }}>
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          {types.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          {statuses.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select name="source_account" value={filters.source_account} onChange={handleFilterChange}>
          <option value="">All Sources</option>
          {accounts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select name="destination_account" value={filters.destination_account} onChange={handleFilterChange}>
          <option value="">All Destinations</option>
          {accounts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <button onClick={fetchTransactions}>Apply Filters</button>
      </div>

      <h2>{form.id ? "Edit" : "Add"} Transaction</h2>
      <form onSubmit={handleSubmit}>
        <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
        <select name="type" value={form.type} onChange={handleFormChange} required>
          <option value="">-- Type --</option>
          {types.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select name="status" value={form.status} onChange={handleFormChange} required>
          <option value="">-- Status --</option>
          {statuses.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select name="source_account" value={form.source_account} onChange={handleFormChange} required>
          <option value="">-- Source --</option>
          {accounts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select name="destination_account" value={form.destination_account} onChange={handleFormChange} required>
          <option value="">-- Destination --</option>
          {accounts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <input name="amount" type="number" value={form.amount} onChange={handleFormChange} required placeholder="Amount" />
        <input name="purpose" value={form.purpose} onChange={handleFormChange} required placeholder="Purpose" />
        <button type="submit">{form.id ? "Update" : "Add"}</button>
      </form>

      <h2>Batch Upload</h2>
      <input type="file" accept=".csv, application/json" onChange={handleFileUpload} />

      <h2>Export</h2>
      <button onClick={() => downloadFile("csv")}>Download CSV</button>
      <button onClick={() => downloadFile("xlsx")}>Download XLSX</button>

      <h2>Transactions</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Type</th>
            <th>Status</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn.id}>
              <td>{txn.id}</td>
              <td>{txn.date}</td>
              <td>{txn.type}</td>
              <td>{txn.status}</td>
              <td>{txn.source_account}</td>
              <td>{txn.destination_account}</td>
              <td>{txn.amount}</td>
              <td>{txn.purpose}</td>
              <td>
                <button onClick={() => handleEdit(txn)}>Edit</button>
                <button onClick={() => handleDelete(txn.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
