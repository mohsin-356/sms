import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Text,
  Badge,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Avatar,
  HStack,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
// Custom components
import Card from '../../../../components/card/Card';
// Icons
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdEmail,
  MdPhone,
  MdRemoveRedEye,
} from 'react-icons/md';
// Helpers
import { getStatusColor } from '../../../../utils/helpers';
// API
import * as studentsApi from '../../../../services/api/students';

export default function StudentsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch students from backend
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {};
        if (searchQuery) params.q = searchQuery;
        if (filterClass !== 'all') params.class = filterClass;
        const { data } = await studentsApi.list(params);
        const rows = Array.isArray(data?.rows) ? data.rows : data; // accept either shape
        setStudents(rows || []);
      } catch (e) {
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [searchQuery, filterClass]);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rfidTag.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    const matchesStatus = filterStatus === 'all' || student.feeStatus === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Handle actions
  const handleAddStudent = () => {
    navigate('/admin/students/add');
  };

  const handleEditStudent = (studentId) => {
    navigate(`/admin/students/edit/${studentId}`);
  };

  const handleViewStudent = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  const handleDeleteStudent = async (student) => {
    try {
      await studentsApi.remove(student.id);
      toast({ title: 'Deleted', description: `${student.name} removed`, status: 'success' });
      // refresh list
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (filterClass !== 'all') params.class = filterClass;
      const { data } = await studentsApi.list(params);
      const rows = Array.isArray(data?.rows) ? data.rows : data;
      setStudents(rows || []);
    } catch (e) {
      toast({ title: 'Failed to delete', status: 'error' });
    }
  };

  const handleContactParent = (student) => {
    toast({
      title: 'Contact Parent',
      description: `Opening communication with ${student.parentName}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Student Management
          </Text>
          <Text fontSize='md' color='gray.500'>
            Manage all students and RFID tags
          </Text>
        </Box>
        <Button
          leftIcon={<MdAdd />}
          colorScheme='blue'
          onClick={handleAddStudent}
        >
          Add New Student
        </Button>
      </Flex>

      {/* Filters */}
      <Card p='20px' mb='20px'>
        <Flex gap='10px' flexWrap='wrap'>
          <InputGroup w={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.300' />
            </InputLeftElement>
            <Input
              placeholder='Search by name, ID, or RFID...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select
            w={{ base: '100%', md: '150px' }}
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            icon={<MdFilterList />}
          >
            <option value='all'>All Classes</option>
            <option value='9'>Class 9</option>
            <option value='10'>Class 10</option>
            <option value='11'>Class 11</option>
            <option value='12'>Class 12</option>
          </Select>
          
          <Select
            w={{ base: '100%', md: '150px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            icon={<MdFilterList />}
          >
            <option value='all'>All Status</option>
            <option value='paid'>Fee Paid</option>
            <option value='pending'>Fee Pending</option>
            <option value='overdue'>Fee Overdue</option>
          </Select>
        </Flex>
      </Card>

      {/* Students Table */}
      <Card p='20px'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>STUDENT</Th>
                <Th>ROLL NO.</Th>
                <Th>CLASS</Th>
                <Th>RFID TAG</Th>
                <Th>BUS #</Th>
                <Th>ATTENDANCE</Th>
                <Th>FEE STATUS</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStudents.map((student) => (
                <Tr key={student.id}>
                  <Td>
                    <HStack spacing='12px'>
                      <Avatar
                        size='sm'
                        name={student.name}
                        src={student.avatar}
                      />
                      <Box>
                        <Text fontWeight='500'>{student.name}</Text>
                        <Text fontSize='xs' color='gray.500'>
                          {student.email}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize='sm' fontWeight='500'>
                      {student.rollNumber}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme='purple'>
                      {student.class}-{student.section}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize='sm' fontFamily='mono'>
                      {student.rfidTag}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme='blue'>{student.busNumber}</Badge>
                  </Td>
                  <Td>
                    <HStack>
                      <Text fontSize='sm' fontWeight='500'>
                        {student.attendance}%
                      </Text>
                      <Badge
                        colorScheme={
                          student.attendance >= 90
                            ? 'green'
                            : student.attendance >= 75
                            ? 'orange'
                            : 'red'
                        }
                      >
                        {student.attendance >= 90
                          ? 'Good'
                          : student.attendance >= 75
                          ? 'Average'
                          : 'Low'}
                      </Badge>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(student.feeStatus)}>
                      {student.feeStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MdMoreVert />}
                        variant='ghost'
                        size='sm'
                      />
                      <MenuList>
                        <MenuItem
                          icon={<MdRemoveRedEye />}
                          onClick={() => handleViewStudent(student.id)}
                        >
                          View Details
                        </MenuItem>
                        <MenuItem
                          icon={<MdEdit />}
                          onClick={() => handleEditStudent(student.id)}
                        >
                          Edit Student
                        </MenuItem>
                        <MenuItem
                          icon={<MdEmail />}
                          onClick={() => handleContactParent(student)}
                        >
                          Contact Parent
                        </MenuItem>
                        <MenuItem
                          icon={<MdDelete />}
                          color='red.500'
                          onClick={() => handleDeleteStudent(student)}
                        >
                          Delete Student
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {filteredStudents.length === 0 && (
          <Flex justify='center' align='center' h='100px'>
            <Text color='gray.500'>No students found</Text>
          </Flex>
        )}
      </Card>
    </Box>
  );
}
