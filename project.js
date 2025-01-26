import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Button, TextField, Modal, Box, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleLogin} style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
      </form>
    </div>
  );
}

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "students"));
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "students"), formData);
      setShowModal(false);
      setFormData({});
      const querySnapshot = await getDocs(collection(db, "students"));
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error adding student: ", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      setStudents(students.filter((student) => student.id !== id));
    } catch (err) {
      console.error("Error deleting student: ", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Students</h1>
      <Button variant="contained" onClick={() => setShowModal(true)}>
        Add Student
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Section</TableCell>
            <TableCell>Roll Number</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell>{student.section}</TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>
                <Button onClick={() => alert("View")}>View</Button>
                <Button onClick={() => alert("Edit")}>Edit</Button>
                <Button onClick={() => handleDelete(student.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box style={{ padding: 20, background: "#fff", margin: "100px auto", maxWidth: 500 }}>
          <h2>Add Student</h2>
          <form onSubmit={handleAddStudent}>
            {["Name", "Class", "Section", "Roll Number"].map((field) => (
              <TextField
                key={field}
                label={field}
                fullWidth
                margin="normal"
                value={formData[field] || ""}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              />
            ))}
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error logging out: ", err);
    }
  };
  if (!user) {
    return <LoginPage onLogin={() => setUser(auth.currentUser)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/students" element={<StudentsPage />} />
        <Route path="*" element={<Navigate to="/students" />} />
      </Routes>
      <Button onClick={handleLogout} variant="contained" style={{ position: "fixed", bottom: 20, right: 20 }}>
        Logout
      </Button>
    </Router>
  );
}

export default App;