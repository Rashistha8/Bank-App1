import { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Select, Row, Col, Typography, Space, Statistic, Tag, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { transactionsAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { transactions: data } = await transactionsAPI.getAll({
        type: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0]?.format('YYYY-MM-DD'),
        endDate: dates[1]?.format('YYYY-MM-DD'),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: null,
        endDate: null,
      }));
    }
  };

  const handleTypeChange = (value) => {
    setFilters((prev) => ({ ...prev, type: value }));
  };

  const handleReset = () => {
    setFilters({
      type: 'all',
      startDate: null,
      endDate: null,
    });
  };

  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalDeposits - totalWithdrawals;

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => dayjs(date).format('MMM D, YYYY h:mm A'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Deposit', value: 'deposit' },
        { text: 'Withdrawal', value: 'withdraw' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => (
        <Tag color={type === 'deposit' ? 'green' : 'red'}>
          {type === 'deposit' ? (
            <><ArrowUpOutlined /> Deposit</>
          ) : (
            <><ArrowDownOutlined /> Withdrawal</>
          )}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => (
        <Text strong style={{ color: record.type === 'deposit' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'deposit' ? '+' : '-'}${amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      align: 'right',
      render: (balance) => <Text>${balance.toLocaleString()}</Text>,
    },
  ];

  return (
    <div>
      <Title level={4}>Transaction Reports</Title>
      <Text type="secondary">View and filter your transaction history</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Deposits"
              value={totalDeposits}
              precision={2}
              prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              suffix="USD"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Withdrawals"
              value={totalWithdrawals}
              precision={2}
              prefix={<ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
              suffix="USD"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Net Amount"
              value={netAmount}
              precision={2}
              prefix="$"
              valueStyle={{ color: netAmount >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <FilterOutlined />
            <Text strong>Filters:</Text>
            <RangePicker
              onChange={handleDateChange}
              value={
                filters.startDate && filters.endDate
                  ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                  : null
              }
            />
            <Select
              value={filters.type}
              onChange={handleTypeChange}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'deposit', label: 'Deposits Only' },
                { value: 'withdraw', label: 'Withdrawals Only' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Reset
            </Button>
          </Space>
        </div>

        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          locale={{
            emptyText: 'No transactions found',
          }}
        />
      </Card>
    </div>
  );
}

export default Reports;
