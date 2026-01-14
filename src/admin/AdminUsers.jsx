import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import Loading from "../utilities/laoding/Loading";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // 1. On combine Prénom et Nom comme dans le Dashboard
            fullName:
              data.prenom || data.nom
                ? `${data.prenom || ""} ${data.nom || ""}`.trim()
                : "Utilisateur sans nom",
            // 2. On sécurise le solde (convertir en nombre ou 0 par défaut)
            coins: Number(data.coins) || 0,
          };
        });
        setUsers(usersList);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 3. Filtrer sur le fullName reconstruit
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestion des Utilisateurs</h1>
        <div className="search-bar">
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Coins (Solde)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#6b7280",
                  }}
                >
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">
                        {/* Affiche la première lettre du prénom ou 'U' */}
                        {user.prenom
                          ? user.prenom.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <span>{user.fullName}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 500 }}>
                    {user.coins.toLocaleString()}
                  </td>
                  <td>
                    <Link to={`/admin/users/${user.id}`} className="btn-action">
                      Gérer <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
