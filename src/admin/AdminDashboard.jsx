import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import {
  Users,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Coins,
  CreditCard,
  Gift,
  Activity,
  Calendar,
} from "lucide-react";
import "./AdminDashboard.css";
import { Link } from "react-router-dom";
import Loading from "../utilities/laoding/Loading";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    totalCoins: 0,
    virementsCount: 0,
    flashAccountsCount: 0,
    giftsCount: 0,
    messagesCount: 0,
  });

  const [chartData, setChartData] = useState([]); // Données pour le graphique
  const [recentOperations, setRecentOperations] = useState([]); // Historique unifié
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const totalCoins = usersData.reduce(
          (acc, curr) => acc + (Number(curr.coins) || 0),
          0
        );

        // 2. Fetch Services Data
        const virementsSnap = await getDocs(collection(db, "virements"));
        const flashAccSnap = await getDocs(collection(db, "purchasedAccounts")); // Achat de compte
        const clientAccSnap = await getDocs(collection(db, "clientAccesses")); // Création compte pro
        const giftsSnap = await getDocs(collection(db, "orders")); // Cadeaux
        const messagesSnap = await getDocs(collection(db, "contact_messages"));

        // 3. Calcul des Totaux
        setStats({
          usersCount: usersSnap.size,
          totalCoins: totalCoins,
          virementsCount: virementsSnap.size,
          flashAccountsCount: flashAccSnap.size + clientAccSnap.size,
          giftsCount: giftsSnap.size,
          messagesCount: messagesSnap.size,
        });

        // 4. Fusionner et trier pour "Dernières Opérations"
        const allOps = [
          ...virementsSnap.docs.map((d) => ({
            type: "virement",
            date: d.data().createdAt,
            ...d.data(),
          })),
          ...flashAccSnap.docs.map((d) => ({
            type: "flash",
            date: d.data().dateAchat,
            ...d.data(),
          })),
          ...giftsSnap.docs.map((d) => ({
            type: "gift",
            date: d.data().orderDate,
            ...d.data(),
          })),
        ];

        // Trier par date décroissante
        allOps.sort((a, b) => {
          const dateA = a.date?.toDate
            ? a.date.toDate()
            : new Date(a.date || 0);
          const dateB = b.date?.toDate
            ? b.date.toDate()
            : new Date(b.date || 0);
          return dateB - dateA;
        });

        setRecentOperations(allOps.slice(0, 7)); // Prendre les 7 dernières

        // 5. Générer les données du Graphique (7 derniers jours)
        const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        const today = new Date();
        const last7DaysData = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dayName = days[d.getDay()];

          // Compter les opérations pour ce jour
          const count = allOps.filter((op) => {
            const opDate = op.date?.toDate
              ? op.date.toDate()
              : new Date(op.date || 0);
            return (
              opDate.getDate() === d.getDate() &&
              opDate.getMonth() === d.getMonth()
            );
          }).length;

          last7DaysData.push({
            day: dayName,
            count: count,
            height: Math.min(count * 10 + 10, 100),
          }); // Hauteur min 10%
        }
        setChartData(last7DaysData);
      } catch (error) {
        console.error("Erreur dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de Bord</h1>
          <p>Vue d'ensemble et évolution des services.</p>
        </div>
        <div className="date-badge">
          <Calendar size={14} />
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </div>

      {/* --- CARTES KPI GLOBALES --- */}
      <div className="kpi-grid">
        <div className="kpi-card highlight">
          <div className="kpi-icon-bg">
            <Users size={20} />
          </div>
          <div>
            <span className="kpi-label">Utilisateurs</span>
            <span className="kpi-value">{stats.usersCount}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg">
            <Coins size={20} />
          </div>
          <div>
            <span className="kpi-label">Coins en circulation</span>
            <span className="kpi-value">
              {stats.totalCoins.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-bg">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="kpi-label">Messages</span>
            <span className="kpi-value">{stats.messagesCount}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-layout">
        {/* COLONNE GAUCHE : DÉTAIL SERVICES + GRAPHIQUE */}
        <div className="layout-col-main">
          {/* GRAPHIQUE D'ÉVOLUTION */}
          <div className="section-card chart-section">
            <div className="card-header-simple">
              <h3>
                <Activity size={18} /> Activité (7 derniers jours)
              </h3>
            </div>
            <div className="chart-container">
              {chartData.map((data, index) => (
                <div key={index} className="chart-bar-group">
                  <div
                    className="chart-bar"
                    style={{ height: `${data.height}%` }}
                  >
                    <span className="tooltip">{data.count} ops</span>
                  </div>
                  <span className="chart-label">{data.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DÉTAIL PAR SERVICE */}
          <h3 className="section-title">Performance par Service</h3>
          <div className="services-stats-grid">
            <div className="service-stat-card">
              <div className="svc-header">
                <span className="svc-icon color-blue">
                  <ArrowUpRight size={18} />
                </span>
                <span className="svc-name">Virements</span>
              </div>
              <div className="svc-body">
                <span className="svc-count">{stats.virementsCount}</span>
                <span className="svc-sub">Total effectués</span>
              </div>
            </div>

            <div className="service-stat-card">
              <div className="svc-header">
                <span className="svc-icon color-green">
                  <CreditCard size={18} />
                </span>
                <span className="svc-name">Comptes Flash</span>
              </div>
              <div className="svc-body">
                <span className="svc-count">{stats.flashAccountsCount}</span>
                <span className="svc-sub">Créés / Vendus</span>
              </div>
            </div>

            <div className="service-stat-card">
              <div className="svc-header">
                <span className="svc-icon color-purple">
                  <Gift size={18} />
                </span>
                <span className="svc-name">Cadeaux</span>
              </div>
              <div className="svc-body">
                <span className="svc-count">{stats.giftsCount}</span>
                <span className="svc-sub">Envoyés</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : DERNIÈRES OPÉRATIONS */}
        <div className="layout-col-side">
          <div className="section-card full-height">
            <div className="card-header-simple">
              <h3>Dernières Opérations</h3>
              <Link to="/admin/orders" className="link-sm">
                Voir tout
              </Link>
            </div>
            <div className="operations-list">
              {recentOperations.length === 0 ? (
                <p className="empty-text">Aucune activité récente.</p>
              ) : (
                recentOperations.map((op, idx) => (
                  <div key={idx} className="op-item">
                    <div className={`op-icon type-${op.type}`}>
                      {op.type === "virement" && <ArrowUpRight size={14} />}
                      {op.type === "flash" && <CreditCard size={14} />}
                      {op.type === "gift" && <Gift size={14} />}
                    </div>
                    <div className="op-info">
                      <span className="op-title">
                        {op.type === "virement" &&
                          `Virement de ${op.montant} ${op.devise || "€"}`}
                        {op.type === "flash" &&
                          `Compte ${op.banque || "Client"}`}
                        {op.type === "gift" && `Cadeau: ${op.giftName}`}
                      </span>
                      <span className="op-date">
                        {op.date?.toDate
                          ? op.date.toDate().toLocaleDateString()
                          : "Récemment"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
