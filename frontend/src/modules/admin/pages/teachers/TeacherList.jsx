import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Select,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { SearchIcon, AddIcon, DownloadIcon, ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { 
  MdMoreVert,
  MdPeople,
  MdSchool,
  MdTrendingUp,
  MdPersonAdd,
} from 'react-icons/md';

function TeacherList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Color mode values
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  
  // Mock teacher data
  const teachers = [
    {
      id: 1,
      name: "Robert Smith",
      photo: "https://bit.ly/ryan-florence",
      qualification: "PhD Mathematics",
      subjects: ["Mathematics", "Physics"],
      classes: ["10A", "11B", "12A"],
      employeeId: "TCH001",
      email: "robert@school.edu",
      phone: "9876543210",
      employmentType: "fullTime",
      status: "active"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      photo: "https://bit.ly/sage-adebayo",
      qualification: "MSc Biology",
    },
    {
      id: 3,
      name: 'Ms. Emily Rodriguez',
      email: 'emily.rodriguez@school.edu',
      phone: '+1 (555) 345-6789',
      subject: 'English Literature',
      department: 'Arts',
      qualification: 'MA English',
      experience: '6 years',
      status: 'Active',
      joiningDate: '2021-03-22',
      salary: '$4,200',
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      email: 'james.wilson@school.edu',
      phone: '+1 (555) 456-7890',
      subject: 'Chemistry',
      department: 'Science',
      qualification: 'PhD Chemistry',
      experience: '15 years',
      status: 'On Leave',
      joiningDate: '2015-09-01',
      salary: '$5,800',
    },
    {
      id: 5,
      name: 'Mrs. Lisa Thompson',
      email: 'lisa.thompson@school.edu',
      phone: '+1 (555) 567-8901',
      subject: 'History',
      department: 'Social Studies',
      qualification: 'MA History',
      experience: '10 years',
      status: 'Active',
      joiningDate: '2019-02-14',
      salary: '$4,800',
    },
  ];

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter((teacher) => {
    const name = teacher.name || '';
    const email = teacher.email || '';
    const subject = teacher.subject || '';
    const dept = teacher.department || '';
    const status = teacher.status || '';

    const matchesSearch = [name, email, subject]
      .some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = !departmentFilter || dept.toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus = !statusFilter || status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'Active').length,
    onLeave: teachers.filter(t => t.status === 'On Leave').length,
    departments: [...new Set(teachers.map(t => t.department))].length,
  };

  return (
    <Box 
      pt={{ base: '130px', md: '80px', xl: '80px' }} 
      px={4}
      bg="gray.50"
      minH="100vh"
    >
      {/* Page Header */}
      <Flex 
        mb={6} 
        justify="space-between" 
        align="center" 
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Box>
          <Heading 
            size="lg" 
            color="gray.800" 
            mb={2}
          >
            Teachers Management
          </Heading>
          <Text color="gray.600" fontSize="md">
            Manage teaching staff and their information ({filteredTeachers.length} teachers)
          </Text>
        </Box>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          size="md"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
        >
          Add New Teacher
        </Button>
      </Flex>

      {/* Statistics Cards - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' icon={<Icon as={MdPeople} w='24px' h='24px' color='white' />} />}
          name='Total Teachers'
          value={String(stats.total)}
          growth='+2%'
          trendData={[5,6,7,8,9,10]}
          trendColor='#4facfe'
          compact
        />
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' icon={<Icon as={MdSchool} w='24px' h='24px' color='white' />} />}
          name='Active Teachers'
          value={String(stats.active)}
          growth='+1%'
          trendData={[2,3,4,4,5,6]}
          trendColor='#43e97b'
          compact
        />
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#f7971e 0%,#ffd200 100%)' icon={<Icon as={MdPersonAdd} w='24px' h='24px' color='white' />} />}
          name='On Leave'
          value={String(stats.onLeave)}
          growth='+0%'
          trendData={[1,1,1,2,2,stats.onLeave]}
          trendColor='#f7971e'
          compact
        />
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' icon={<Icon as={MdSchool} w='24px' h='24px' color='white' />} />}
          name='Departments'
          value={String(stats.departments)}
          growth='+0%'
          trendData={[1,1,2,2,2,stats.departments]}
          trendColor='#a18cd1'
          compact
        />
      </SimpleGrid>

      {/* Search and Filters */}
      <Card mb={6}>
        <Box p={4}>
          <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
            <InputGroup flex={2}>
              <InputLeftElement>
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search teachers by name, email, or subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </InputGroup>
            <Select 
              placeholder="All Departments" 
              maxW="200px"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="science">Science</option>
              <option value="arts">Arts</option>
              <option value="social studies">Social Studies</option>
            </Select>
            <Select 
              placeholder="All Status" 
              maxW="150px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="on leave">On Leave</option>
            </Select>
          </Flex>
        </Box>
      </Card>

      {/* Teachers Table */}
      <Card>
        <Box p={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="gray.800">
              Teachers List ({filteredTeachers.length})
            </Heading>
            <HStack>
              <Button size="sm" variant="outline" leftIcon={<DownloadIcon />}>
                Export
              </Button>
            </HStack>
          </Flex>
        </Box>
        
        <Box pt={0} px={4} pb={4}>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Teacher</Th>
                  <Th>Contact</Th>
                  <Th>Subject</Th>
                  <Th>Department</Th>
                  <Th>Experience</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredTeachers.map((teacher) => (
                  <Tr key={teacher.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <Flex align="center">
                        <Avatar 
                          size="sm" 
                          name={teacher.name} 
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="bold" color="gray.800">
                            {teacher.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {teacher.qualification}
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Box>
                        <Text fontSize="sm" color="gray.800">
                          {teacher.email}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {teacher.phone}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue" variant="subtle">
                        {teacher.subject}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.800">
                        {teacher.department}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.800">
                        {teacher.experience}
                      </Text>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={teacher.status === 'Active' ? 'green' : 'orange'}
                        variant="subtle"
                      >
                        {teacher.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MdMoreVert />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem icon={<ViewIcon />}>View Details</MenuItem>
                          <MenuItem icon={<EditIcon />}>Edit Teacher</MenuItem>
                          <MenuItem icon={<DeleteIcon />} color="red.500">
                            Delete Teacher
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          
          {/* Pagination */}
          {filteredTeachers.length > 0 && (
            <Flex justify="space-between" align="center" pt={4} borderTop="1px" borderColor="gray.200" mt={4}>
              <Text fontSize="sm" color="gray.600">
                Showing 1 to {filteredTeachers.length} of {filteredTeachers.length} teachers
              </Text>
              <HStack>
                <Button size="sm" variant="outline" isDisabled>
                  Previous
                </Button>
                <Button size="sm" colorScheme="blue">
                  1
                </Button>
                <Button size="sm" variant="outline" isDisabled>
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
          
          {/* No Results */}
          {filteredTeachers.length === 0 && (
            <Box textAlign="center" py={10}>
              <Icon as={MdPeople} boxSize={12} color="gray.400" mb={4} />
              <Text fontSize="lg" color="gray.600" mb={2}>
                No teachers found
              </Text>
              <Text fontSize="sm" color="gray.500">
                Try adjusting your search criteria or add a new teacher
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default TeacherList;
