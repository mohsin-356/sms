import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Grid,
  GridItem,
  Flex,
  SimpleGrid,
  Button,
  ButtonGroup,
  IconButton,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { MdSchedule, MdAccessTime, MdGridOn, MdAssignment, MdUpdate, MdCalendarToday, MdChevronLeft, MdChevronRight, MdViewWeek, MdViewModule, MdFileDownload, MdPictureAsPdf } from 'react-icons/md';
import * as teacherApi from '../../../../services/api/teachers';
import useClassOptions from '../../../../hooks/useClassOptions';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  { id: 1, start: '08:00', end: '08:45', label: '1st Period' },
  { id: 2, start: '08:50', end: '09:35', label: '2nd Period' },
  { id: 3, start: '09:40', end: '10:25', label: '3rd Period' },
  { id: 4, start: '10:30', end: '11:15', label: '4th Period' },
  { id: 5, start: '11:20', end: '12:05', label: '5th Period' },
  { id: 6, start: '12:10', end: '12:55', label: '6th Period' },
  { id: 7, start: '13:30', end: '14:15', label: '7th Period' },
  { id: 8, start: '14:20', end: '15:05', label: '8th Period' },
];

export default function Timetable() {
  const toast = useToast();
  const { classOptions, sectionsByClass, sectionOptions } = useClassOptions();
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [view, setView] = useState('week'); // 'day' | 'week' | 'month'
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [timetable, setTimetable] = useState({}); // local edits by date
  const [schedules, setSchedules] = useState([]); // fetched teacher schedules
  const [loading, setLoading] = useState(false);
  const editDisc = useDisclosure();
  const [editValues, setEditValues] = useState([]);
  const [modalPeriodCount, setModalPeriodCount] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const teacherOptions = useMemo(() => (
    (teachers || [])
      .map((t) => ({ id: String(t.id ?? t.teacherId), name: t.name || t.fullName || 'Unnamed Teacher' }))
      .filter((t) => t.id)
  ), [teachers]);

  // Initialize class/section from options
  useEffect(() => {
    if (!cls && classOptions.length) setCls(classOptions[0]);
  }, [classOptions, cls]);
  useEffect(() => {
    if (!cls) return;
    const secs = sectionsByClass[cls] || [];
    if (!section && secs.length) setSection(secs[0]);
    if (section && secs.length && !secs.includes(section)) setSection(secs[0]);
  }, [cls, sectionsByClass, section]);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherApi.listSchedules();
      const rows = Array.isArray(data) ? data : [];
      setSchedules(rows);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load schedules', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const fetchTeachers = useCallback(async () => {
    setTeacherLoading(true);
    try {
      const res = await teacherApi.list({ page: 1, pageSize: 200 });
      const rows = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
      setTeachers(rows);
      if (!selectedTeacher && rows.length) setSelectedTeacher(String(rows[0].id ?? rows[0].teacherId));
    } catch (_) {
      setTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  }, [selectedTeacher]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  // Build period slots from timeSlotIndex or startTime
  const { slotKeys, periodLabels } = useMemo(() => {
    const filtered = schedules.filter((s) => (
      (!cls || (s.className || s.class) === cls) &&
      (!section || (s.section || '') === section)
    ));
    let indices = new Set();
    let times = [];
    filtered.forEach((s) => {
      if (s.timeSlotIndex !== undefined && s.timeSlotIndex !== null) {
        indices.add(Number(s.timeSlotIndex));
      } else if (s.startTime) {
        times.push({ start: s.startTime, end: s.endTime });
      }
    });
    let slots = [];
    let labels = [];
    if (indices.size) {
      slots = Array.from(indices).sort((a, b) => a - b);
      labels = slots.map((i, idx) => `P${idx + 1}`);
    } else {
      // derive from unique start times
      const uniq = [];
      const keyer = new Set();
      times.forEach((t) => {
        const k = `${t.start}-${t.end}`;
        if (!keyer.has(k)) { keyer.add(k); uniq.push(t); }
      });
      uniq.sort((a, b) => String(a.start).localeCompare(String(b.start)));
      slots = uniq.map((_, idx) => idx);
      labels = uniq.map((t, idx) => `P${idx + 1}`);
    }
    return { slotKeys: slots, periodLabels: labels };
  }, [schedules, cls, section]);

  // Grid data by day -> slotIndex -> value
  const grid = useMemo(() => {
    const out = {};
    days.forEach((d) => { out[d] = Array(Math.max(1, slotKeys.length)).fill(''); });
    schedules.forEach((s) => {
      const c = s.className || s.class;
      const sec = s.section || '';
      if (c !== cls || sec !== section) return;
      const day = s.dayName || s.day;
      if (!out[day]) return;
      let idx;
      if (s.timeSlotIndex !== undefined && s.timeSlotIndex !== null && slotKeys.length) {
        idx = slotKeys.indexOf(Number(s.timeSlotIndex));
      } else if (slotKeys.length && s.startTime) {
        // fallback: approximate by ordered startTime index
        idx = slotKeys.indexOf(slotKeys.find((_, i) => i >= 0));
      } else {
        idx = 0;
      }
      if (idx < 0 || idx >= out[day].length) return;
      const label = s.subject || '—';
      const room = s.room ? ` • ${s.room}` : '';
      out[day][idx] = label + room;
    });
    return out;
  }, [schedules, cls, section, slotKeys]);

  const totalCells = days.length * Math.max(1, periodLabels.length);
  const filledCells = useMemo(() => {
    return days.reduce((acc, d) => acc + (grid[d]?.filter(Boolean).length || 0), 0);
  }, [grid]);
  const freeCells = totalCells - filledCells;
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    days.forEach((d) => (grid[d] || []).forEach((s) => s && set.add(s.replace(/\s•.*$/, ''))));
    return set.size;
  }, [grid]);

  // Helpers
  const fmt = (d) => d.toISOString().slice(0, 10);
  const dayName = (d) => days[d.getDay() === 0 ? 6 : d.getDay() - 1];
  const monthMatrix = useMemo(() => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startDay = (d.getDay() + 6) % 7; // Monday start
    const first = new Date(d);
    first.setDate(1 - startDay);
    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        const cell = new Date(first);
        cell.setDate(first.getDate() + w * 7 + i);
        row.push(cell);
      }
      weeks.push(row);
    }
    return weeks;
  }, [selectedDate]);

  const getScheduleForDate = (date) => {
    const key = `${cls}-${section}`;
    const map = timetable[key] || {};
    const k = fmt(date);
    if (map[k]) return map[k];
    const dn = dayName(date);
    return grid[dn] || Array(Math.max(1, periodLabels.length)).fill('');
  };

  const setScheduleForDate = (date, values) => {
    const k = `${cls}-${section}`;
    setTimetable((prev) => ({ ...prev, [k]: { ...(prev[k] || {}), [fmt(date)]: values } }));
  };

  const dayNameToNumber = useMemo(() => ({ Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 }), []);

  const upsertBackendForDate = async (date, values) => {
    if (!cls || !section) return;
    const dn = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const dow = dayNameToNumber[dn];
    const teacherId = Number(selectedTeacher) || null;
    if (!teacherId) return;
    const rel = schedules.filter((s) => (s.className || s.class) === cls && (s.section || '') === section && (s.dayName || s.day) === dn);
    const byIndex = new Map();
    rel.forEach((s) => { if (s.timeSlotIndex) byIndex.set(Number(s.timeSlotIndex), s); });
    for (let i = 0; i < values.length; i++) {
      const subject = String(values[i] || '').trim();
      const slotIndex = i + 1;
      const slotMeta = timeSlots[slotIndex - 1] || { start: '08:00', end: '08:45', label: `P${slotIndex}` };
      const existing = byIndex.get(slotIndex);
      if (subject) {
        if (existing) {
          const updates = {};
          if (existing.subject !== subject) updates.subject = subject;
          if (Object.keys(updates).length) {
            await teacherApi.updateScheduleSlot(existing.id, { ...updates });
          }
        } else {
          await teacherApi.createScheduleSlot({
            teacherId,
            dayOfWeek: String(dow),
            startTime: slotMeta.start,
            endTime: slotMeta.end,
            class: cls,
            section,
            subject,
            room: null,
            timeSlotIndex: slotIndex,
            timeSlotLabel: slotMeta.label || `P${slotIndex}`,
          });
        }
      } else if (existing) {
        await teacherApi.deleteScheduleSlot(existing.id);
      }
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Timetable</Heading>
          <Text color={textColorSecondary}>Plan lessons with day/week/month views</Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdSchedule color="white" />} />}
          name="Total Periods"
          value={String(totalCells)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdGridOn color="white" />} />}
          name="Scheduled"
          value={String(filledCells)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)" icon={<MdAccessTime color="white" />} />}
          name="Free Slots"
          value={String(freeCells)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdGridOn color="white" />} />}
          name="Subjects"
          value={String(uniqueSubjects)}
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <Select w="180px" value={cls || ''} onChange={(e) => setCls(e.target.value)} placeholder="Select class">
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select w="140px" value={section || ''} onChange={(e) => setSection(e.target.value)} placeholder="Select section" isDisabled={!cls}>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select w="220px" value={selectedTeacher || ''} onChange={(e) => setSelectedTeacher(e.target.value)} placeholder={teacherLoading ? 'Loading teachers...' : 'Select teacher'} isDisabled={teacherLoading || !cls}>
              {teacherOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </HStack>
          <HStack>
            <Button leftIcon={<MdUpdate />} colorScheme="blue" onClick={fetchSchedules} isLoading={loading}>Refresh</Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue">Generate Report</Button>
            <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue">Export CSV</Button>
            <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue">Export PDF</Button>
          </HStack>
        </Flex>
      </Card>

      {/* View Controls */}
      <Card mb={5}>
        <Flex p={4} gap={4} align="center" direction={{ base: 'column', md: 'row' }}>
          <ButtonGroup isAttached>
            <Button leftIcon={<MdCalendarToday />} variant={view==='day'?'solid':'outline'} colorScheme='blue' onClick={()=>setView('day')}>Day</Button>
            <Button leftIcon={<MdViewWeek />} variant={view==='week'?'solid':'outline'} colorScheme='blue' onClick={()=>setView('week')}>Week</Button>
            <Button leftIcon={<MdViewModule />} variant={view==='month'?'solid':'outline'} colorScheme='blue' onClick={()=>setView('month')}>Month</Button>
          </ButtonGroup>
          <HStack>
            <IconButton aria-label='Prev' icon={<MdChevronLeft />} onClick={()=>{
              const d=new Date(selectedDate);
              if(view==='day') d.setDate(d.getDate()-1);
              else if(view==='week') d.setDate(d.getDate()-7);
              else d.setMonth(d.getMonth()-1);
              setSelectedDate(d);
            }} />
            <Input type='date' value={fmt(selectedDate)} onChange={(e)=>setSelectedDate(new Date(e.target.value))} maxW='220px' />
            <IconButton aria-label='Next' icon={<MdChevronRight />} onClick={()=>{
              const d=new Date(selectedDate);
              if(view==='day') d.setDate(d.getDate()+1);
              else if(view==='week') d.setDate(d.getDate()+7);
              else d.setMonth(d.getMonth()+1);
              setSelectedDate(d);
            }} />
            <Button onClick={()=>setSelectedDate(new Date())}>Today</Button>
          </HStack>
        </Flex>
      </Card>

      {/* Views */}
      {view==='day' && (
        <Card>
          <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            {cls} - Section {section} • {selectedDate.toDateString()}
          </Heading>
          <Box p={4}>
            <Grid templateColumns={`160px 1fr`} gap={2}>
              {periodLabels.map((p, i)=> (
                <React.Fragment key={p}>
                  <GridItem><Text fontWeight='600'>{p}</Text></GridItem>
                  <GridItem>
                    <Box borderWidth='1px' borderRadius='md' p={3} cursor='pointer' onClick={()=>{ const existing=[...getScheduleForDate(selectedDate)]; const baseCount=periodLabels.length||6; const count=Math.max(existing.length||0, baseCount); const padded=[...existing]; while(padded.length<count) padded.push(''); setModalPeriodCount(count); setEditValues(padded); editDisc.onOpen(); }}>
                      <Text>{getScheduleForDate(selectedDate)[i] || '- (click to edit)'}</Text>
                    </Box>
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        </Card>
      )}

      {view==='week' && (()=>{
        const d = new Date(selectedDate); const day=(d.getDay()+6)%7; const monday=new Date(d); monday.setDate(d.getDate()-day);
        const weekDays=[...Array(5)].map((_,i)=>{ const t=new Date(monday); t.setDate(monday.getDate()+i); return t;});
        return (
          <Card overflow="hidden">
            <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
              {cls} - Section {section} • Week of {monday.toDateString()}
            </Heading>
            <Box overflowX="auto">
              <Grid templateColumns={`120px repeat(${Math.max(1, periodLabels.length)}, 1fr)`} gap={2} p={4}>
                <GridItem />
                {periodLabels.map((p) => (
                  <GridItem key={p}>
                    <Text fontWeight="600" textAlign="center">{p}</Text>
                  </GridItem>
                ))}
                {weekDays.map((dateObj) => (
                  <React.Fragment key={fmt(dateObj)}>
                    <GridItem><Text fontWeight="600">{dayName(dateObj)}<br/><Text as='span' fontWeight='400' color={textColorSecondary}>{fmt(dateObj)}</Text></Text></GridItem>
                    {periodLabels.map((p, i) => (
                      <GridItem key={`${fmt(dateObj)}-${p}`}>
                        <Box borderWidth="1px" borderRadius="md" p={3} textAlign="center" cursor='pointer' _hover={{ bg: useColorModeValue('gray.50','gray.700') }} onClick={()=>{ setSelectedDate(dateObj); const existing=[...getScheduleForDate(dateObj)]; const baseCount=periodLabels.length||6; const count=Math.max(existing.length||0, baseCount); const padded=[...existing]; while(padded.length<count) padded.push(''); setModalPeriodCount(count); setEditValues(padded); editDisc.onOpen(); }}>
                          <Text>{getScheduleForDate(dateObj)[i] || '-'}</Text>
                        </Box>
                      </GridItem>
                    ))}
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
          </Card>
        );
      })()}

      {view==='month' && (
        <Card>
          <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            {cls} - Section {section} • {selectedDate.toLocaleString(undefined,{ month:'long', year:'numeric'})}
          </Heading>
          <Box p={4}>
            <Grid templateColumns="repeat(7, 1fr)" gap={2}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d)=> (
                <GridItem key={d}><Text fontWeight='600' textAlign='center'>{d}</Text></GridItem>
              ))}
              {monthMatrix.map((week, wi)=> week.map((d, i)=> (
                <GridItem key={`${wi}-${i}`}>
                  <Box borderWidth='1px' borderRadius='md' p={2} h='90px' cursor='pointer' _hover={{ bg: useColorModeValue('gray.50','gray.700') }} onClick={()=>{ setSelectedDate(d); const existing=[...getScheduleForDate(d)]; const baseCount=periodLabels.length||6; const count=Math.max(existing.length||0, baseCount); const padded=[...existing]; while(padded.length<count) padded.push(''); setModalPeriodCount(count); setEditValues(padded); editDisc.onOpen(); }} opacity={d.getMonth()===selectedDate.getMonth()?1:0.5}>
                    <Text fontSize='sm' fontWeight='600'>{d.getDate()}</Text>
                    <Text color={textColorSecondary} fontSize='xs' mt={1}>{getScheduleForDate(d).filter(Boolean).length} periods</Text>
                  </Box>
                </GridItem>
              )))}
            </Grid>
          </Box>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Schedule • {fmt(selectedDate)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack mb={3}>
              <Text fontWeight='600'>Periods</Text>
              <Select maxW='120px' value={String(modalPeriodCount|| (periodLabels.length||6))} onChange={(e)=>{ const next=Number(e.target.value)||0; setModalPeriodCount(next); setEditValues((prev)=>{ const arr=[...prev]; if(arr.length<next){ while(arr.length<next) arr.push(''); } else if(arr.length>next){ arr.length=next; } return arr; }); }}>
                {Array.from({length:12}).map((_,i)=>(<option key={i+1} value={i+1}>{i+1}</option>))}
              </Select>
            </HStack>
            <Grid templateColumns='120px 1fr' gap={3}>
              {Array.from({length: modalPeriodCount || (periodLabels.length||6)}).map((_, idx)=> (
                <React.Fragment key={`edit-${idx}`}>
                  <GridItem><Text fontWeight='600'>{`P${idx+1}`}</Text></GridItem>
                  <GridItem>
                    <Input placeholder='Subject' value={editValues[idx] || ''} onChange={(e)=>{ const v=[...editValues]; v[idx]=e.target.value; setEditValues(v); }} />
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async ()=>{ try { const count=modalPeriodCount || (periodLabels.length||6); const values=editValues.slice(0, count); setScheduleForDate(selectedDate, values); await upsertBackendForDate(selectedDate, values); await fetchSchedules(); toast({ title: 'Timetable saved', status: 'success', duration: 2500, isClosable: true }); editDisc.onClose(); } catch (e) { toast({ title: 'Save failed', description: e?.message || 'Unable to save timetable', status: 'error', duration: 3500, isClosable: true }); } }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
