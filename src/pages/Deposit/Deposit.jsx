import React, { useState } from "react";
import { Card, Form, InputNumber, Button, Typography, message } from "antd";
import { useAuth } from "../../provider/AuthContextProvider";
import { useNavigate } from "react-router";

const { Title } = Typography;

function Deposit() {
  const { deposit } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ amount, description }) => {
    if (!amount || amount <= 0) {
      return message.error("Please enter a valid amount.");
    }
    setLoading(true);
    try {
      const result = await deposit(amount, description || "Deposit");

      // Save transaction locally for recent list
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      transactions.push({
        id: Date.now(),
        userId: result.userId,
        type: "deposit",
        amount,
        description: description || "Deposit",
        date: new Date().toISOString(),
      });
      localStorage.setItem("transactions", JSON.stringify(transactions));

      message.success("Deposit successful!");
      navigate("/"); // back to dashboard
    } catch (err) {
      console.error(err);
      message.error("Deposit failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: "50px auto", borderRadius: 12 }}>
      <Title level={4}>Deposit Funds</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Amount (USD)"
          name="amount"
          rules={[{ required: true, message: "Please enter an amount" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <InputNumber style={{ width: "100%" }} placeholder="Optional" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Deposit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Deposit;
