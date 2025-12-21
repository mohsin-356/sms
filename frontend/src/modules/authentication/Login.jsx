import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  VStack,
  HStack,
} from '@chakra-ui/react';
// Custom components
import DefaultAuth from '../../layouts/auth/Default';
// Assets - use custom public illustration instead of Horizon UI screen
const illustration = '/imgbin_04038f2dad4024b37accec200ae57e31.png';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
// Auth Context
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const googleBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.200');
  const googleText = useColorModeValue('navy.700', 'white');
  const googleHover = useColorModeValue(
    { bg: 'gray.200' },
    { bg: 'whiteAlpha.300' }
  );
  const googleActive = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.200' }
  );

  // State
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerKey, setOwnerKey] = useState('');
  const [showOwnerKey, setShowOwnerKey] = useState(false);
  const [setupMode, setSetupMode] = useState(true);
  const [allowedModules, setAllowedModules] = useState([]);
  const [ownerStep1Passed, setOwnerStep1Passed] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const ownerKeyRef = useRef(null);
  const ownerKeyBlockRef = useRef(null);

  const ownerEmail = 'qutaibah@mindspire.org';
  const isOwnerEmail = String(email).trim().toLowerCase() === ownerEmail.toLowerCase();

  // No prefetched/demo credentials: all fields start empty and must be entered by user
  // Presets exist only for clickable badges and do NOT prefill inputs
  const quickProfiles = useMemo(() => ({
    admin: { email: 'admin@mindspire.com', password: 'password123', label: 'Admin', colorScheme: 'blue' },
    teacher: { email: 'teacher@mindspire.com', password: 'password123', label: 'Teacher', colorScheme: 'green' },
    student: { email: 'student@mindspire.com', password: 'password123', label: 'Student', colorScheme: 'purple' },
    driver: { email: 'driver@mindspire.com', password: 'password123', label: 'Driver', colorScheme: 'orange' },
    parent: { email: 'parent@mindspire.com', password: 'password123', label: 'Parent', colorScheme: 'pink' },
    owner: { email: ownerEmail, password: 'Qutaibah@123', label: 'Owner', colorScheme: 'teal' },
  }), []);

  // Auth Context
  const { login, clearError, loading: authLoading, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle click to show/hide password
  const handleClick = () => setShow(!show);

  // On mount and auth changes, just clear previous errors (do not auto-redirect)
  useEffect(() => {
    clearError();
  }, [clearError, isAuthenticated]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const st = await authApi.status();
        if (mounted) {
          setSetupMode(!Boolean(st?.licensingConfigured));
          setAllowedModules(Array.isArray(st?.allowedModules) ? st.allowedModules : []);
        }
      } catch (_) {
        if (mounted) setSetupMode(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Two-step owner flow: first verify creds, then prompt for license key
    if (isOwnerEmail) {
      // Step 1: if key not yet provided and step1 not passed, attempt login to trigger owner-key prompt
      if (!ownerStep1Passed && !ownerKey) {
        const res = await login(email, password, false, undefined);
        if (!res?.success) {
          const requiresKey =
            res?.status === 401 && (res?.data?.code === 'OWNER_KEY_REQUIRED' || /owner key|key not set/i.test(String(res?.error || '')));
          if (requiresKey) {
            // Treat as step-1 success; reveal key field without showing error
            clearError();
            setOwnerStep1Passed(true);
            setTimeout(() => {
              try { ownerKeyRef.current?.focus({ preventScroll: false }); } catch (_) {}
            }, 0);
          }
        }
        // stop here regardless; either error shown or key field revealed
        return;
      }
      // Step 2: have key, complete login
      await login(email, password, false, ownerKey);
      return;
    }
    // Non-owner: normal login
    await login(email, password, false, undefined);
  };

  // Role selection: updates view (does not autofill or auto-login)
  const selectRole = (role) => {
    setSelectedRole(role);
  };

  // After step 1 passes, focus license key
  useEffect(() => {
    if (ownerStep1Passed) {
      setTimeout(() => {
        try { ownerKeyRef.current?.focus({ preventScroll: false }); } catch (_) {}
      }, 0);
    }
  }, [ownerStep1Passed]);

  // Ensure the license key block scrolls into view whenever owner is selected or owner email typed
  useEffect(() => {
    if (selectedRole === 'owner' || isOwnerEmail) {
      setTimeout(() => {
        try { ownerKeyBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
      }, 0);
    }
  }, [selectedRole, isOwnerEmail]);

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w='100%'
        mx={{ base: 'auto', lg: '0px' }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }}
        flexDirection='column'>
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>
            MINDSPIRE SMS
          </Heading>
          <Text
            mb='36px'
            ms='4px'
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            School Management System Portal
          </Text>
        </Box>
        
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: '100%', md: '420px' }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: 'auto', lg: 'unset' }}
          me='auto'
          mb={{ base: '20px', md: 'auto' }}>
          
          {/* Status banner only; no demo credentials or autofill */}
          <Alert status='info' borderRadius='12px' mb='20px'>
            <AlertIcon />
            <VStack align='start' spacing={1} fontSize='sm'>
              {setupMode ? (
                <Text fontSize='xs' color='red.600'>System setup pending: Only Owner can sign in until licensing is configured.</Text>
              ) : (
                <Text fontSize='xs' color='gray.600'>Licensed modules active: {allowedModules.length ? allowedModules.join(', ') : 'None'}</Text>
              )}
            </VStack>
          </Alert>

          {/* Role badges (select to filter fields; no autofill) */}
          <Alert status='info' variant='subtle' borderRadius='12px' mb='20px'>
            <VStack align='start' spacing={2} w='100%'>
              <Text fontWeight='600'>Roles</Text>
              <HStack spacing={3} flexWrap='wrap' sx={{ gap: '10px 8px' }}>
                {Object.entries(quickProfiles).map(([roleKey, preset]) => {
                  const roleAllowed = (() => {
                    if (roleKey === 'owner') return true;
                    if (setupMode) return false;
                    const has = (name) => allowedModules.includes(name);
                    if (roleKey === 'admin') return has('Dashboard') || has('Settings');
                    if (roleKey === 'teacher') return has('Teachers');
                    if (roleKey === 'student') return has('Students');
                    if (roleKey === 'parent') return has('Parents');
                    if (roleKey === 'driver') return has('Transport');
                    return false;
                  })();
                  const disabled = authLoading || !roleAllowed;
                  const isSelected = selectedRole === roleKey;
                  return (
                    <Button
                      key={roleKey}
                      size='sm'
                      colorScheme={preset.colorScheme}
                      variant={roleAllowed ? (isSelected ? 'solid' : 'outline') : 'outline'}
                      onClick={() => selectRole(roleKey)}
                      isDisabled={disabled}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </HStack>
            </VStack>
          </Alert>

          {/* Error Alert */}
          {authError && (
            <Alert status='error' borderRadius='12px' mb='20px'>
              <AlertIcon />
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel
                display='flex'
                ms='4px'
                fontSize='sm'
                fontWeight='500'
                color={textColor}
                mb='8px'>
                Email or Phone<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant='auth'
                fontSize='sm'
                ms={{ base: '0px', md: '0px' }}
                type='text'
                placeholder='Enter email or WhatsApp number (+92...)'
                mb='24px'
                fontWeight='500'
                size='lg'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
              />
              
              <FormLabel
                ms='4px'
                fontSize='sm'
                fontWeight='500'
                color={textColor}
                display='flex'>
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size='md'>
                <Input
                  isRequired={true}
                  fontSize='sm'
                  placeholder='Enter your password'
                  mb='24px'
                  size='lg'
                  type={show ? 'text' : 'password'}
                  variant='auth'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading}
                />
                <InputRightElement display='flex' alignItems='center' mt='4px'>
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>

              {(selectedRole === 'owner' || isOwnerEmail || ownerStep1Passed) ? (
                <>
                  <FormLabel
                    ms='4px'
                    fontSize='sm'
                    fontWeight='500'
                    color={textColor}
                    display='flex'>
                    License Key<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <InputGroup size='md' ref={ownerKeyBlockRef}>
                    <Input
                      isRequired={ownerStep1Passed}
                      fontSize='sm'
                      placeholder='Enter license key'
                      mb='24px'
                      size='lg'
                      type={showOwnerKey ? 'text' : 'password'}
                      variant='auth'
                      value={ownerKey}
                      onChange={(e) => setOwnerKey(e.target.value)}
                      ref={ownerKeyRef}
                      disabled={authLoading || !ownerStep1Passed}
                    />
                    <InputRightElement display='flex' alignItems='center' mt='4px'>
                      <Icon
                        color={textColorSecondary}
                        _hover={{ cursor: 'pointer' }}
                        as={showOwnerKey ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                        onClick={() => setShowOwnerKey(!showOwnerKey)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </>
              ) : null}
              
              {/* Removed 'Keep me logged in' and 'Forgot password?' from UI */}
              
              <Button
                fontSize='sm'
                variant='brand'
                fontWeight='500'
                w='100%'
                h='50'
                mb='24px'
                type='submit'
                isLoading={authLoading}
                isDisabled={authLoading || (setupMode && !isOwnerEmail)}
                loadingText='Signing in...'>
                Sign In
              </Button>
              <Flex justifyContent='center' mb='24px'>
                <Text color={textColorSecondary} fontSize='sm'>
                  Don't have an account?{' '}
                  <NavLink to='/auth/sign-up'>
                    <Text as='span' color={brandStars} fontWeight='500'>
                      Sign up
                    </Text>
                  </NavLink>
                </Text>
              </Flex>
            </FormControl>
          </form>
          
          <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='start'
            maxW='100%'
            mt='0px'>
            <Text color={textColorSecondary} fontWeight='400' fontSize='14px'>
              MINDSPIRE School Management System
            </Text>
            <Text color={textColorSecondary} fontWeight='400' fontSize='14px'>
              Version 1.0.0
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
