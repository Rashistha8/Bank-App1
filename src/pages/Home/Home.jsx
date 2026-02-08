import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Typography, Space, Progress, notification } from "antd";
import { WalletOutlined, ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, MinusOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useAuth } from "../../provider/AuthContextProvider";
import { transactionsAPI } from "../../services/api";


const { Title, Text } = Typography;

function Home() {
  const { user, account, refreshBalance, deposit, withdraw } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    await refreshBalance();
    const { transactions } = await transactionsAPI.getRecent(5);
    setTransactions(transactions);
    setLoading(false);
  };

  const handleDeposit = async () => {
    const result = await deposit(100, "Quick Deposit");
    notification.success({ message: "Deposit successful", description: `+$${result.transaction.amount}` });
    await loadData();
  };

  const handleWithdraw = async () => {
    const result = await withdraw(50, "Quick Withdrawal");
    notification.success({ message: "Withdrawal successful", description: `-$${result.transaction.amount}` });
    await loadData();
  };

  // Chart data for deposits vs withdrawals
  const deposits = transactions.filter(t => t.type === "deposit").map(t => t.amount);
  const withdrawals = transactions.filter(t => t.type === "withdraw").map(t => t.amount);

  const chartData = {
    labels: transactions.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      { label: "Deposits", data: deposits, backgroundColor: "#52c41a" },
      { label: "Withdrawals", data: withdrawals, backgroundColor: "#ff4d4f" },
    ],
  };

  return (
    <div>
      <Title level={3}>Welcome back, {user.firstName}!</Title>
      <Text type="secondary">Here's a modern overview of your account</Text>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: "#e6f7ff", borderRadius: 12 }}>
            <Text strong>Current Balance</Text>
            <Title>${account.balance.toLocaleString()}</Title>
            <Text type="secondary">Account: {account.accountNumber}</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: "#fff7e6", borderRadius: 12 }}>
            <Text strong>Savings Goal</Text>
            <Progress percent={Math.min(account.balance / 5000 * 100, 100)} status="active" />
            <Text type="secondary">Goal: $5000</Text>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card style={{ background: "#f9f0ff", borderRadius: 12 }}>
            <Text strong>Quick Actions</Text>
            <Space style={{ marginTop: 12 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleDeposit}>Deposit $100</Button>
              <Button icon={<MinusOutlined />} onClick={handleWithdraw}>Withdraw $50</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card style={{ borderRadius: 12 }}>
            <Text strong>Recent Transactions</Text>
           
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card style={{ borderRadius: 12 }}>
            <Text strong>Account Holder</Text>
            <Text><UserOutlined /> {user.firstName} {user.lastName}</Text>
            <Text type="secondary">{user.email}</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Home;
