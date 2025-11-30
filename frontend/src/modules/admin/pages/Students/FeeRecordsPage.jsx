import React, { useEffect, useState } from 'react';
import {
  Box, Text, Flex, Button, SimpleGrid, Badge, Table,
  Thead, Tbody, Tr, Th, Td, TableContainer,
  Select, useToast,
  Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
// Custom components
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
// Icons
import {
  MdAttachMoney, MdCheckCircle, MdAccessTime,
  MdWarning, MdPayment, MdPrint, MdEmail,
  MdFileDownload, MdLocalOffer, MdCalendarMonth,
  MdDirectionsBus, MdReceipt, MdVisibility, MdSearch,
  MdFilterList, MdRemoveRedEye,
} from 'react-icons/md';
// API
import * as studentsApi from '../../../../services/api/students';

export default function FeeRecordsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [fees, setFees] = useState({ invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState({ invoiceId: '', amount: '', method: 'Cash' });

  // Load students
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(data?.rows) ? data.rows : data;
        setStudents(rows || []);
        if ((rows || []).length) setSelectedId(String(rows[0].id));
      } catch (e) {
        toast({ title: 'Failed to load students', status: 'error' });
      }
    };
    load();
  }, []);

  // Load fees for selected student
  useEffect(() => {
    if (!selectedId) return;
    const loadFees = async () => {
      try {
        setLoading(true);
        const { data } = await studentsApi.getFees(selectedId);
        setFees(data || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
      } catch (e) {
        toast({ title: 'Failed to load fee records', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadFees();
  }, [selectedId]);
  
  const openPayment = (invoiceId, outstanding) => {
    setPayment({ invoiceId, amount: String(outstanding || ''), method: 'Cash' });
    onOpen();
  };
  
  const submitPayment = async () => {
    try {
      await studentsApi.recordPayment(selectedId, { invoiceId: Number(payment.invoiceId), amount: Number(payment.amount), method: payment.method });
      toast({ title: 'Payment recorded', status: 'success' });
      onClose();
      // refresh fees
      const { data } = await studentsApi.getFees(selectedId);
      setFees(data || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
    } catch (e) {
      const message = e?.response?.data?.message || 'Failed to record payment';
      toast({ title: 'Error', description: message, status: 'error' });
    }
  };
  
  const totals = fees.totals || { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Fee Records
          </Text>
          <Text fontSize='md' color='gray.500'>
            Manage student fee invoices and payments
          </Text>
        </Box>
        <Select maxW='280px' value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>
          ))}
        </Select>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
              icon={<MdAttachMoney w='28px' h='28px' color='white' />}
            />
          }
          name='Total Invoiced'
          value={`PKR ${Math.round(totals.totalInvoiced).toLocaleString()}`}
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #01B574 0%, #51CB97 100%)'
              icon={<MdCheckCircle w='28px' h='28px' color='white' />}
            />
          }
          name='Total Paid'
          value={`PKR ${Math.round(totals.totalPaid).toLocaleString()}`}
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #FFB36D 0%, #FD7853 100%)'
              icon={<MdAccessTime w='28px' h='28px' color='white' />}
            />
          }
          name='Outstanding'
          value={`PKR ${Math.round(totals.totalOutstanding).toLocaleString()}`}
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #E31A1A 0%, #FF8080 100%)'
              icon={<MdWarning w='28px' h='28px' color='white' />}
            />
          }
          name='Overdue'
          value={`PKR 0`}
        />
      </SimpleGrid>

      {/* Invoices Table */}
      <Card p='20px'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Invoice ID</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>Paid</Th>
                <Th isNumeric>Outstanding</Th>
                <Th>Status</Th>
                <Th>Due Date</Th>
                <Th>Issued</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {fees.invoices.map((inv) => (
                <Tr key={inv.id}>
                  <Td>INV-{inv.id}</Td>
                  <Td isNumeric>PKR {Math.round(inv.amount).toLocaleString()}</Td>
                  <Td isNumeric>PKR {Math.round(inv.paid).toLocaleString()}</Td>
                  <Td isNumeric>PKR {Math.round(inv.outstanding).toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={inv.status === 'paid' ? 'green' : inv.status === 'pending' ? 'orange' : 'red'}>
                      {inv.status.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</Td>
                  <Td>{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '-'}</Td>
                  <Td>
                    {inv.outstanding > 0 && (
                      <Button size='sm' colorScheme='blue' leftIcon={<MdPayment />} onClick={()=>openPayment(inv.id, inv.outstanding)}>
                        Pay
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
              {!fees.invoices.length && (
                <Tr><Td colSpan={8}>No invoices</Td></Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>

      {/* Payment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Invoice</FormLabel>
              <Select value={payment.invoiceId} onChange={(e)=>setPayment(p=>({ ...p, invoiceId: e.target.value }))}>
                {fees.invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>INV-{inv.id} (Outstanding PKR {Math.round(inv.outstanding).toLocaleString()})</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Amount</FormLabel>
              <Input type='number' value={payment.amount} onChange={(e)=>setPayment(p=>({ ...p, amount: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Method</FormLabel>
              <Select value={payment.method} onChange={(e)=>setPayment(p=>({ ...p, method: e.target.value }))}>
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={submitPayment} isDisabled={!payment.invoiceId || !payment.amount}>Record</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}