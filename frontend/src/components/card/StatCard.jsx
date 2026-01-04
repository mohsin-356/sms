import React from 'react';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Icon,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';

const StatCard = ({ title, value, subValue, note, icon, trend, trendValue, colorScheme = 'blue' }) => {
    const bg = useColorModeValue('white', 'navy.800');
    const textColor = useColorModeValue('gray.700', 'white');
    const subTextColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <Box
            bg={bg}
            p='24px'
            borderRadius='20px'
            boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'
            position='relative'
            overflow='hidden'
        >
            <Flex justify='space-between' align='start' mb='10px'>
                <VStack align='start' spacing='0px'>
                    <Icon as={icon} w='28px' h='28px' color={`${colorScheme}.500`} mb='10px' />
                    <Text color={subTextColor} fontSize='sm' fontWeight='500' mb='4px'>
                        {title}
                    </Text>
                    <HStack align='baseline' spacing='6px'>
                        <Text color={textColor} fontSize='2xl' fontWeight='700'>
                            {value}
                        </Text>
                        {subValue && (
                            <Text color={subTextColor} fontSize='lg' fontWeight='500'>
                                - {subValue}
                            </Text>
                        )}
                    </HStack>
                </VStack>

                <Box position='relative'>
                    {trend && (
                        <Badge
                            colorScheme={trend === 'up' ? 'green' : 'red'}
                            borderRadius='full'
                            px='2'
                            fontSize='xs'
                        >
                            {trend === 'up' ? '+' : ''}{trendValue}%
                        </Badge>
                    )}
                </Box>
            </Flex>
            <Text color={subTextColor} fontSize='xs'>
                {note}
            </Text>

            <Box
                position='absolute'
                right='0'
                top='30%'
                h='40%'
                w='4px'
                bg={`${colorScheme}.500`}
                borderLeftRadius='4px'
            />
        </Box>
    );
};

export default StatCard;
