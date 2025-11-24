import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useColorModeValue,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  VStack,
  useToast,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { 
  MdSearch,
  MdAdd,
  MdBookmark,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdPerson,
  MdCheck,
  MdAssignment,
  MdClass,
  MdSettings,
  MdPersonAdd,
  MdBook,
} from 'react-icons/md';

const TeacherSubjects = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [assignmentType, setAssignmentType] = useState('');
  const toast = useToast();
  
  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Mock subject data
  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH', department: 'Science & Mathematics' },
    { id: 2, name: 'Physics', code: 'PHYS', department: 'Science & Mathematics' },
    { id: 3, name: 'Chemistry', code: 'CHEM', department: 'Science & Mathematics' },
    { id: 4, name: 'Biology', code: 'BIO', department: 'Science & Mathematics' },
    { id: 5, name: 'English', code: 'ENG', department: 'Languages' },
    { id: 6, name: 'History', code: 'HIST', department: 'Humanities' },
    { id: 7, name: 'Geography', code: 'GEO', department: 'Humanities' },
    { id: 8, name: 'Computer Science', code: 'CS', department: 'Technology' },
    { id: 9, name: 'Physical Education', code: 'PE', department: 'Physical Education' },
    { id: 10, name: 'Art', code: 'ART', department: 'Arts' },
  ];
  
  // Mock teachers data
  const teachers = [
    { 
      id: 1, 
      name: 'Robert Smith', 
      photo: 'https://bit.ly/ryan-florence',
      qualification: 'PhD Mathematics',
      subjects: [1, 2], // Subject IDs
      primarySubject: 1,
      classes: ['10A', '11B', '12A'],
      experience: '8 years',
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      photo: 'https://bit.ly/sage-adebayo',
      qualification: 'MSc Biology',
      subjects: [4, 3],
      primarySubject: 4,
      classes: ['9A', '10B', '11A'],
      experience: '5 years',
    },
    { 
      id: 3, 
      name: 'Michael Brown', 
      photo: 'https://bit.ly/kent-c-dodds',
      qualification: 'MA English Literature',
      subjects: [5, 6],
      primarySubject: 5,
      classes: ['9B', '10C', '11C'],
      experience: '6 years',
    },
    { 
      id: 4, 
      name: 'David Wilson', 
      photo: 'https://bit.ly/prosper-baba',
      qualification: 'MSc Computer Science',
      subjects: [8, 1],
      primarySubject: 8,
      classes: ['8A', '9C', '12B'],
      experience: '4 years',
    },
    { 
      id: 5, 
      name: 'Jennifer Lee', 
      photo: 'https://bit.ly/code-beast',
      qualification: 'MSc Chemistry',
      subjects: [3, 4],
      primarySubject: 3,
      classes: ['10C', '11A', '12C'],
      experience: '7 years',
    },
  ];
  
  // Mock classes data
  const classes = [
    { id: '10A', name: '10th Grade Section A' },
    { id: '10B', name: '10th Grade Section B' },
    { id: '10C', name: '10th Grade Section C' },
    { id: '11A', name: '11th Grade Section A' },
    { id: '11B', name: '11th Grade Section B' },
    { id: '11C', name: '11th Grade Section C' },
    { id: '12A', name: '12th Grade Section A' },
    { id: '12B', name: '12th Grade Section B' },
    { id: '12C', name: '12th Grade Section C' },
  ];
  
  // Get subject name by ID
  const getSubjectById = (id) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.name : 'Unknown';
  };
  
  // Get subject color
  const getSubjectColor = (name) => {
    switch (name) {
      case 'Mathematics': return 'blue';
      case 'Physics': return 'cyan';
      case 'Chemistry': return 'pink';
      case 'Biology': return 'green';
      case 'English': return 'purple';
      case 'History': return 'orange';
      case 'Geography': return 'yellow';
      case 'Computer Science': return 'teal';
      case 'Physical Education': return 'red';
      case 'Art': return 'gray';
      default: return 'blue';
    }
  };
  
  // Get teachers by subject ID
  const getTeachersBySubject = (subjectId) => {
    return teachers.filter(teacher => teacher.subjects.includes(subjectId));
  };
  
  // Calculate subject distribution
  const subjectDistribution = subjects.map(subject => ({
    ...subject,
    teacherCount: getTeachersBySubject(subject.id).length
  }));
  
  // Handle assign subject modal
  const openAssignModal = (teacher, type) => {
    setSelectedTeacher(teacher);
    setAssignmentType(type);
    onOpen();
  };
  
  // Handle assign subject submit
  const handleAssignSubject = () => {
    toast({
      title: 'Subject Assigned',
      description: `${assignmentType === 'add' ? 'Added new subject to' : 'Updated primary subject for'} ${selectedTeacher.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Subject Assignment</Heading>
          <Text color={textColorSecondary}>Manage teacher subject allocations</Text>
        </Box>
        <Button
          leftIcon={<Icon as={MdAdd} />}
          colorScheme="blue"
          size="md"
        >
          Add New Subject
        </Button>
      </Flex>
      
      {/* Subject Stats - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' icon={<Icon as={MdBook} w='24px' h='24px' color='white' />} />}
          name='Total Subjects'
          value={String(subjects.length)}
          growth={`Across ${Array.from(new Set(subjects.map(s => s.department))).length} departments`}
          trendData={[subjects.length-2, subjects.length-1, subjects.length]}
          trendColor='#4facfe'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' icon={<Icon as={MdAssignment} w='24px' h='24px' color='white' />} />}
          name='Subject Allocations'
          value={String(teachers.reduce((sum, teacher) => sum + teacher.subjects.length, 0))}
          growth={`${(teachers.reduce((sum, teacher) => sum + teacher.subjects.length, 0) / teachers.length).toFixed(1)} per teacher`}
          trendData={[1,2,3,4,5]}
          trendColor='#43e97b'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' icon={<Icon as={MdPersonAdd} w='24px' h='24px' color='white' />} />}
          name='Teachers'
          value={String(teachers.length)}
          growth={`Qualified for ${subjects.length} subjects`}
          trendData={[teachers.length-1, teachers.length, teachers.length]}
          trendColor='#a18cd1'
        />
      </SimpleGrid>
      
      {/* Subject Allocation Table */}
      <Card overflow="hidden" mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Teacher Subject Allocation</Text>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input placeholder="Search teachers or subjects" />
          </InputGroup>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Teacher</Th>
                <Th>Primary Subject</Th>
                <Th>Secondary Subjects</Th>
                <Th>Classes</Th>
                <Th>Experience</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teachers.map((teacher) => (
                <Tr key={teacher.id} _hover={{ bg: hoverBg }}>
                  <Td>
                    <Flex align="center">
                      <Avatar size="sm" src={teacher.photo} name={teacher.name} mr={3} />
                      <Box>
                        <Text fontWeight="medium">{teacher.name}</Text>
                        <Text fontSize="xs" color={textColorSecondary}>{teacher.qualification}</Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getSubjectColor(getSubjectById(teacher.primarySubject))}
                      py={1}
                      px={3}
                      borderRadius="full"
                      fontWeight="medium"
                    >
                      {getSubjectById(teacher.primarySubject)}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1} flexWrap="wrap">
                      {teacher.subjects
                        .filter(id => id !== teacher.primarySubject)
                        .map((subjectId) => (
                          <Badge 
                            key={subjectId}
                            colorScheme={getSubjectColor(getSubjectById(subjectId))}
                            variant="outline"
                            py={0.5}
                            px={2}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {getSubjectById(subjectId)}
                          </Badge>
                        ))
                      }
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1} flexWrap="wrap">
                      {teacher.classes.map((cls) => (
                        <Tag size="sm" key={cls} borderRadius="full" variant="subtle" colorScheme="cyan">
                          <TagLabel>{cls}</TagLabel>
                        </Tag>
                      ))}
                    </HStack>
                  </Td>
                  <Td>{teacher.experience}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        size="sm"
                        rightIcon={<Icon as={MdMoreVert} />}
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem 
                          icon={<Icon as={MdAdd} />} 
                          onClick={() => openAssignModal(teacher, 'add')}
                        >
                          Assign New Subject
                        </MenuItem>
                        <MenuItem 
                          icon={<Icon as={MdEdit} />}
                          onClick={() => openAssignModal(teacher, 'primary')}
                        >
                          Change Primary Subject
                        </MenuItem>
                        <MenuItem icon={<Icon as={MdClass} />}>
                          Update Classes
                        </MenuItem>
                        <Divider />
                        <MenuItem icon={<Icon as={MdDelete} />} color="red.500">
                          Remove Subject
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
      
      {/* Subject Distribution Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Subject Distribution</Text>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon as={MdSettings} />}
          >
            Manage Subjects
          </Button>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Subject</Th>
                <Th>Code</Th>
                <Th>Department</Th>
                <Th isNumeric>Teachers Assigned</Th>
                <Th>Primary Teachers</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subjectDistribution.map((subject) => (
                <Tr key={subject.id} _hover={{ bg: hoverBg }}>
                  <Td>
                    <Badge
                      colorScheme={getSubjectColor(subject.name)}
                      py={1}
                      px={3}
                      borderRadius="full"
                    >
                      {subject.name}
                    </Badge>
                  </Td>
                  <Td fontFamily="mono">{subject.code}</Td>
                  <Td>{subject.department}</Td>
                  <Td isNumeric>{subject.teacherCount}</Td>
                  <Td>
                    <HStack spacing={1}>
                      {teachers
                        .filter(teacher => teacher.primarySubject === subject.id)
                        .map(teacher => (
                          <Avatar 
                            key={teacher.id} 
                            size="xs" 
                            name={teacher.name} 
                            src={teacher.photo} 
                            cursor="pointer" 
                          />
                        ))
                      }
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
      
      {/* Assign Subject Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {assignmentType === 'add' ? 'Assign New Subject' : 'Change Primary Subject'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTeacher && (
              <VStack spacing={4} align="stretch">
                <Flex align="center">
                  <Avatar src={selectedTeacher.photo} name={selectedTeacher.name} size="md" mr={3} />
                  <Box>
                    <Text fontWeight="bold">{selectedTeacher.name}</Text>
                    <Text fontSize="sm" color={textColorSecondary}>{selectedTeacher.qualification}</Text>
                  </Box>
                </Flex>
                
                <Divider />
                
                <FormControl>
                  <FormLabel>
                    {assignmentType === 'add' ? 'Select Subject to Assign' : 'Select New Primary Subject'}
                  </FormLabel>
                  <Select placeholder="Choose a subject">
                    {subjects
                      .filter(subject => 
                        assignmentType === 'add' 
                          ? !selectedTeacher.subjects.includes(subject.id)
                          : selectedTeacher.subjects.includes(subject.id)
                      )
                      .map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))
                    }
                  </Select>
                </FormControl>
                
                {assignmentType === 'add' && (
                  <FormControl>
                    <Checkbox>Make this the primary subject</Checkbox>
                  </FormControl>
                )}
                
                {assignmentType === 'add' && (
                  <FormControl>
                    <FormLabel>Assign Classes</FormLabel>
                    <SimpleGrid columns={2} spacing={2}>
                      {classes.map(cls => (
                        <Checkbox key={cls.id} value={cls.id}>
                          {cls.id} ({cls.name})
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </FormControl>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" leftIcon={<Icon as={MdCheck} />} onClick={handleAssignSubject}>
              {assignmentType === 'add' ? 'Assign Subject' : 'Update Primary Subject'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeacherSubjects;
