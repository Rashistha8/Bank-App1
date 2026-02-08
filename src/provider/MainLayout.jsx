import { useState } from "react";
import { Layout, Menu, Avatar, Typography, Space, Button } from "antd";
import {
  HomeOutlined,
  WalletOutlined,
  MinusCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthContextProvider";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: 18,
          color: "#8bb9e4",
        }}
      >
        Loading...
      </div>
    );

  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: "Dashboard" },
    { key: "/deposit", icon: <WalletOutlined />, label: "Deposit" },
    { key: "/withdraw", icon: <MinusCircleOutlined />, label: "Withdraw" },
    { key: "/reports", icon: <FileTextOutlined />, label: "Reports" },
    { key: "/profile", icon: <UserOutlined />, label: "Profile" },
  ];

  const handleMenuClick = ({ key }) => navigate(key);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Top Navbar */}
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          background: "#011f3b",
        }}
      >
        <Text style={{ color: "#f7eeee", fontSize: 20, fontWeight: 600 }}>
          MyBank
        </Text>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, marginLeft: 24 }}
        />

        <Space size="middle">
          <Avatar icon={<UserOutlined />} />
          <Text style={{ color: "#fff" }}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Button type="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </Header>

      {/* Main Content */}
      <Content style={{ margin: "24px auto", background: "#f3f4f8", padding: 24, minHeight: "80vh", width: "90%", borderRadius: 12 }}>
        <Outlet />
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: "center", background: "#27303f", color: "#f7eeee" }}>
        MyBank App - Secure Banking Made Simple
      </Footer>
    </Layout>
  );
}
