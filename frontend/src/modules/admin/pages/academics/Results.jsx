import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { MdTrendingUp, MdDoneAll, MdBook, MdAssignment, MdFileDownload, MdPictureAsPdf, MdRefresh, MdSearch, MdRemoveRedEye, MdEdit, MdDelete } from 'react-icons/md';
import * as resultsApi from '../../../../services/api/results';
import useClassOptions from '../../../../hooks/useClassOptions';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => (n===null||n===undefined||Number.isNaN(Number(n)) ? '' : String(n));

export default function Results() {
  const [cls, setCls] = useState('All');
  const [section, setSection] = useState('All');
  const [query, setQuery] = useState(''); // student name
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [active, setActive] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const disc = useDisclosure();
  const editDisc = useDisclosure();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const { classOptions, sectionsByClass } = useClassOptions();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subjects = useMemo(() => ['All', ...Array.from(new Set(rows.map(r => r.subject).filter(Boolean)))], [rows]);
  const classes = useMemo(() => ['All', ...classOptions], [classOptions]);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (cls !== 'All') params.className = cls;
      if (section !== 'All' && section) params.section = section;
      if (subject !== 'All') params.subject = subject;
      if (studentId) params.studentId = Number(studentId);
      if (query) params.q = query;
      const res = await resultsApi.list(params);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setRows(items);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load results', status: 'error' });
      setRows([]);
    } finally { setLoading(false); }
  }, [cls, section, subject, studentId, query, toast]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const avgOverall = useMemo(() => Math.round(rows.reduce((a, b) => a + (Number(b.marks)||0), 0) / (rows.length || 1)), [rows]);
  const passOverall = useMemo(() => {
    const total = rows.length || 1; const passed = rows.filter(r => (Number(r.marks)||0) >= 33).length; return Math.round((passed/total)*100);
  }, [rows]);
  const subjectsCount = useMemo(() => new Set(rows.map(r => r.subject)).size, [rows]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Results</Heading>
          <Text color={textColorSecondary}>Summary and detailed results by subject</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAssignment />} variant='outline' colorScheme='blue' onClick={()=> navigate('/admin/academics/results/generate')}>Generate Results</Button>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={()=>window.location.reload()}>Refresh</Button>
        </ButtonGroup>
      </Flex>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <InputGroup maxW='240px' size='sm'>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search by student name' value={query} onChange={(e)=>setQuery(e.target.value)} />
            </InputGroup>
            <Select size='sm' w="140px" value={cls} onChange={(e) => { setCls(e.target.value); setSection('All'); }}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select size='sm' w="120px" value={section} onChange={(e) => setSection(e.target.value)} isDisabled={cls==='All'}>
              {['All', ...((sectionsByClass[cls] || []))].map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select size='sm' w="150px" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input size='sm' placeholder='Student ID' w='120px' value={studentId} onChange={(e)=> setStudentId(e.target.value.replace(/[^0-9]/g,''))} />
          </HStack>
          <HStack spacing={3} flexWrap='wrap'>
            <Button size='sm' leftIcon={<MdRefresh />} variant='outline' onClick={fetchRows} isLoading={loading}>Refresh</Button>
            <Button size='sm' leftIcon={<MdAssignment />} variant="outline" colorScheme="blue" onClick={()=> window.print()}>Export PDF</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdTrendingUp color="white" />} />}
          name="Average Score"
          value={`${avgOverall}%`}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdDoneAll color="white" />} />}
          name="Pass Rate"
          value={`${passOverall}%`}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdBook color="white" />} />}
          name="Subjects"
          value={String(subjectsCount)}
        />
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Results Table
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selectedIds.length===rows.length && rows.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<rows.length} onChange={(e)=> setSelectedIds(e.target.checked ? rows.map((r)=> r.id) : [])} />
                </Th>
                <Th>Student</Th>
                <Th>Student ID</Th>
                <Th>Class</Th>
                <Th>Exam</Th>
                <Th>Subject</Th>
                <Th isNumeric>Marks</Th>
                <Th>Grade</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={9}><Flex align='center' justify='center' py={6}>Loading...</Flex></Td></Tr>
              ) : rows.map((r) => (
                <Tr key={r.id}>
                  <Td><Checkbox isChecked={selectedIds.includes(r.id)} onChange={()=> setSelectedIds(prev => prev.includes(r.id) ? prev.filter(i=>i!==r.id) : [...prev, r.id])} /></Td>
                  <Td>{r.studentName}</Td>
                  <Td>{r.studentId}</Td>
                  <Td>{r.class}{r.section ? `-${r.section}` : ''}</Td>
                  <Td>{r.examTitle}</Td>
                  <Td>{r.subject}</Td>
                  <Td isNumeric>{fmt(r.marks)}</Td>
                  <Td>{fmt(r.grade)}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View Class Results' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{
                        const params = new URLSearchParams(); if(r.class) params.set('class', r.class); if(r.section) params.set('section', r.section); if(r.examId) params.set('examId', r.examId); if(r.subject) params.set('subject', r.subject);
                        navigate(`/admin/academics/results/class-view?${params.toString()}`);
                      }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setEditItem({ ...r }); editDisc.onOpen(); }} />
                      <IconButton aria-label='Delete' icon={<MdDelete />} size='sm' variant='ghost' colorScheme='red' onClick={async ()=>{
                        if(!window.confirm('Delete this result entry?')) return; try { await resultsApi.remove(r.id); toast({ title:'Deleted', status:'success', duration:1200 }); fetchRows(); } catch { toast({ title:'Delete failed', status:'error' }); }
                      }} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Detail Modal (kept for quick summary if needed) */}
      <Modal isOpen={disc.isOpen} onClose={disc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Result Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{active.studentName}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Exam</Text><Text>{active.examTitle}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Subject</Text><Text>{active.subject}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Marks</Text><Text>{fmt(active.marks)}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Grade</Text><Text>{fmt(active.grade)}</Text></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={disc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editItem && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{editItem.studentName} (ID: {editItem.studentId})</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Exam</Text><Text>{editItem.examTitle}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Subject</Text><Text>{editItem.subject}</Text></HStack>
                <HStack>
                  <Box flex='1'>
                    <Text mb={1}>Marks</Text>
                    <Input type='number' value={fmt(editItem.marks)} onChange={(e)=> setEditItem(it=>({ ...it, marks: e.target.value }))} />
                  </Box>
                  <Box flex='1'>
                    <Text mb={1}>Grade</Text>
                    <Input value={fmt(editItem.grade)} onChange={(e)=> setEditItem(it=>({ ...it, grade: e.target.value }))} />
                  </Box>
                </HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async ()=>{
              if(!editItem) return; try { await resultsApi.update(editItem.id, { marks: editItem.marks===''? null : Number(editItem.marks), grade: editItem.grade || null }); toast({ title:'Result updated', status:'success', duration:1500 }); editDisc.onClose(); fetchRows(); } catch { toast({ title:'Update failed', status:'error' }); }
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
