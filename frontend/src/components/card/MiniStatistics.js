// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Box,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import SparklineChart from "components/charts/SparklineChart";
// Custom icons
import React from "react";

export default function Default(props) {
  const {
    startContent,
    endContent,
    name,
    growth,
    value,
    // optional mini graph data for percentage cards
    trendData,
    trendColor,
  } = props;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const hoverShadow = useColorModeValue(
    "0 12px 30px rgba(15, 23, 42, 0.10)",
    "0 12px 30px rgba(15, 23, 42, 0.65)"
  );

  return (
    <Card
      py='18px'
      cursor='pointer'
      transition='all 0.2s ease'
      _hover={{ boxShadow: hoverShadow, transform: "translateY(-2px)" }}
      _active={{ boxShadow: hoverShadow, transform: "translateY(0px)" }}
    >
      {/* Top row: icon + main value on the left, growth text on the right */}
      <Flex
        my='auto'
        w='100%'
        align='center'
        justify='space-between'
        gap={4}
      >
        <Flex align='center' gap={4}>
          {startContent}

          <Stat my='auto' ms={startContent ? "4px" : "0px"}>
            <StatLabel
              lineHeight='100%'
              color={textColorSecondary}
              fontSize={{
                base: "md",
              }}
            >
              {name}
            </StatLabel>
            <StatNumber
              color={textColor}
              fontSize={{
                base: "3xl",
              }}
            >
              {value}
            </StatNumber>
          </Stat>
        </Flex>

        {growth ? (
          <Flex
            align='flex-end'
            direction='column'
            ms='auto'
            minW='max-content'
          >
            <Text color='green.500' fontSize='sm' fontWeight='700'>
              {growth}
            </Text>
            <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
              since last month
            </Text>
          </Flex>
        ) : (
          <Flex ms='auto'>{endContent}</Flex>
        )}
      </Flex>

      {/* Bottom row: full-width sparkline graph */}
      {trendData && trendData.length > 0 && (
        <Box w='100%' h='48px' mt={4}>
          <SparklineChart data={trendData} color={trendColor} />
        </Box>
      )}
    </Card>
  );
}
