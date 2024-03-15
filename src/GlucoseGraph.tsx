import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Pressable, LayoutAnimation } from 'react-native';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryClipContainer,
  VictoryLabel,
  VictoryLegend,
  VictoryLine,
  VictoryScatter,
  VictoryZoomContainer,
} from 'victory-native';
import { startOfHour, endOfHour } from './helpers';
import type { HealthData } from './data/HealthMetric';
import { FontSize, FontFamily } from './fonts';
import ExpandableButton from './ExpandableButton';
import TrendingUp from './assets/trending_up.svg';
import TrendingFlat from './assets/trending_flat.svg';
import TrendingDown from './assets/trending_down.svg';
import { iso8601ToFormatted } from './helpers';
import ChartDot from './ChartDot';
import colors from './colors';

const WINDOW_WIDTH = Dimensions.get('window').width;
const MARGIN = 24;

const getMetrics = (gcmData: HealthData[]) =>
  gcmData
    .map(({ metric }) => metric)
    .filter((i) => !Number.isNaN(i) && Number(i) !== 0)
    .sort((a, b) => Number(a) - Number(b));

const getDateTicks = ({ start, end }: { start: Date; end: Date }, interval: number) => {
  let lastTick = new Date(
    Math.floor(start.getTime() / interval / 3600 / 1000) * interval * 3600 * 1000
  );
  const ticks: Date[] = [];
  while (lastTick.getTime() < end.getTime()) {
    ticks.push(lastTick);
    lastTick = new Date(lastTick.getTime() + interval * 3600 * 1000);
  }
  return ticks;
};

const getMetricsTrend = (gcmData: HealthData[]): 'up' | 'down' | 'flat' => {
  const lastMetric = gcmData[gcmData.length - 1];
  // datetime range from last metric to 24 hours before last metric
  const range = gcmData
    .filter(
      ({ createdAt }) =>
        new Date(createdAt).getTime() > new Date(lastMetric.createdAt).getTime() - 24 * 3600 * 1000
    )
    .map(({ metric }) => metric);

  const average = range.reduce((acc, curr) => acc + Number(curr), 0) / range.length;

  // If last entry is above average in last 24 hours, trend is up
  if (Number(lastMetric.metric) > average) return 'up';

  // If last entry is below average in last 24 hours, trend is down
  if (Number(lastMetric.metric) < average) return 'down';

  return 'flat';
};

const Indicator: React.FC<{ trend: 'up' | 'down' | 'flat' }> = ({ trend }) => (
  <View style={{ marginLeft: 4 }}>
    {trend === 'up' && <TrendingUp />}
    {trend === 'flat' && <TrendingFlat />}
    {trend === 'down' && <TrendingDown />}
  </View>
);

const GraphView: React.FC<{
  gcmData: HealthData[];
  dateRange: { start: Date; end: Date };
}> = ({ gcmData, dateRange }) => {
  const [isExpaned, setExpaned] = useState(false);
  const trend = getMetricsTrend(gcmData);
  const endDateRangePlusOne = new Date(dateRange.end);
  endDateRangePlusOne.setHours(endDateRangePlusOne.getHours() + 2);

  const dateTicks = getDateTicks({ start: dateRange.start, end: endDateRangePlusOne }, 1);

  return (
    <View style={styles.chartContainer}>
      <View style={{ margin: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.cardTitle}>Glucose level</Text>
          <Text style={styles.cardDescription}>
            updated:{' '}
            {new Date().getTime() - dateRange.end.getTime() > 24 * 3600 * 1000
              ? iso8601ToFormatted(dateRange.end, 'MMM d (ha)')
              : iso8601ToFormatted(dateRange.end, 'h:mma')}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.metricContainer}>
          <Text>
            <Text style={styles.metricText}>
              {Math.round(Number(gcmData[gcmData.length - 1].metric))}
            </Text>
            <Text style={styles.metricUnit}> mg/dL</Text>
          </Text>
          {gcmData.length > 1 ? <Indicator trend={trend} /> : null}
        </View>
        <ExpandableButton
          isExpanded={isExpaned}
          onClick={() => {
            setExpaned(!isExpaned);
          }}
        />
      </View>
      {isExpaned ? (
        <VictoryChart
          width={WINDOW_WIDTH - 2 * MARGIN}
          height={210}
          scale={{ x: 'time', y: 'linear' }}
          domain={{
            x: [startOfHour(dateRange.start), endOfHour(endDateRangePlusOne)],
            y: [50, 210],
          }}
          padding={{ bottom: 50, left: 50, right: 24 }}
          containerComponent={
            <VictoryZoomContainer
              allowZoom={false}
              zoomDomain={{
                x: [
                  startOfHour(endDateRangePlusOne).getTime() - 6 * 3600 * 1000,
                  startOfHour(endDateRangePlusOne).getTime() + 1 * 3600 * 1000,
                ],
                y: [50, 210],
              }}
              clipContainerComponent={<VictoryClipContainer clipPadding={{ top: 10, right: 10 }} />}
            />
          }
        >
          <VictoryLegend
            x={50}
            y={80}
            title='optimal range'
            data={[]}
            style={{ title: { fill: colors.slateBlue, opacity: 0.5, fontSize: 12 } }}
          />
          <VictoryArea
            style={{ data: { fill: '#BBADED1A' } }}
            data={[
              { y: 125, y0: 75, x: startOfHour(dateRange.start) },
              { y: 125, y0: 75, x: endOfHour(endDateRangePlusOne) },
            ]}
            labelComponent={
              <VictoryLabel
                style={{
                  fill: colors.slateBlue,
                  fontSize: 10,
                  fontFamily: FontFamily.familyLight,
                }}
                dx={-36}
                dy={15}
              />
            }
          />
          <VictoryAxis
            style={{
              axis: { opacity: 0.5, color: colors.slateBlue },
              // @ts-expect-error TS(2322): supress
              tickLabels: { fontSize: 10, dx: 2 },
            }}
            tickFormat={(t) => iso8601ToFormatted(t, 'h a')}
            tickValues={dateTicks}
            standalone={false}
          />
          <VictoryAxis
            style={{
              axis: { opacity: 0.5, color: colors.slateBlue },
              // @ts-expect-error TS(2322): supress
              tickLabels: { fontSize: 10, dx: 4, dy: 18, fontFamily: FontFamily.familyBold },
            }}
            tickFormat={(t) =>
              iso8601ToFormatted(t, 'h a') === '12 AM' ? iso8601ToFormatted(t, 'MMM. d') : ''
            }
            tickValues={dateTicks}
            standalone={false}
          />
          <VictoryAxis
            style={{
              axis: { opacity: 0 },
              tickLabels: { fontSize: 10 },
              grid: { stroke: '#eeeeee' },
            }}
            tickValues={[50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300]}
            dependentAxis
            containerComponent={<VictoryZoomContainer zoomDimension='y' />}
            standalone={false}
          />
          <VictoryLine
            style={{
              data: {
                stroke: colors.slateBlue,
                strokeWidth: 5,
                strokeLinecap: 'round',
                opacity: 0.1,
              },
            }}
            data={gcmData.map(({ metric, createdAt }) => ({ x: new Date(createdAt), y: metric }))}
            interpolation='linear'
            standalone={false}
          />
          <VictoryScatter
            // @ts-expect-error TS(2739): supress
            dataComponent={<ChartDot chartHeight={210} />}
            data={gcmData
              .map(({ metric, createdAt }) => ({ x: new Date(createdAt), y: metric }))
              .slice(-1)}
            standalone={false}
          />
        </VictoryChart>
      ) : null}
    </View>
  );
};

const POLLING_INTERVAL = 2 * 60 * 1000; // 2 minutes

const GlucoseGraph: React.FC = () => {
  return null;
  // useEffect(() => {
  //   dispatch(getUserHealthData(HEALTH_METRICS.GLUCOSE));
  //   // poll CGM data every 2 minutes
  //   const interval = setInterval(() => {
  //     dispatch(getUserHealthData(HEALTH_METRICS.GLUCOSE));
  //   }, POLLING_INTERVAL);
  //   return () => clearInterval(interval);
  // }, [dispatch]);

  // const metrics = getMetrics(gcmData);
  // const sortedData = gcmData
  //   .map(({ createdAt, metric }) => ({ createdAt, metric: Number(metric) }))
  //   .filter(({ metric }) => metric >= 40 && metric <= 400)
  //   // .filter(({ createdAt }) => {
  //   //   if ((new Date(createdAt).getTime() / 1000) % 5 === 0) {
  //   //     console.log('remove', createdAt);
  //   //     return false;
  //   //   }
  //   //   return true;
  //   // })
  //   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  // const dates = sortedData.map(({ createdAt }) => new Date(createdAt));

  // return gcmData.length === 0 ? null : (
  //   <>
  //     <Text style={styles.title}>Monitoring</Text>
  //     <View style={styles.container}>
  //       <GraphView
  //         gcmData={sortedData}
  //         dateRange={{ start: dates[0], end: dates[dates.length - 1] }}
  //       />
  //     </View>
  //   </>
  // );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  chartContainer: {
    width: WINDOW_WIDTH - 2 * MARGIN,
    marginTop: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
    borderRadius: 16,
  },
  title: {
    color: colors.greyGrey,
    fontFamily: FontFamily.familyBold,
    marginTop: 24,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  cardTitle: {
    fontFamily: FontFamily.familyBold,
    fontSize: FontSize.sizeNormal,
  },
  cardDescription: {
    fontFamily: FontFamily.familyLight,
    fontSize: FontSize.sizeSmall,
    color: colors.greyGrey,
    marginTop: 2,
  },
  metricContainer: {
    flexDirection: 'row',
    display: 'flex',
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: colors.primaryPavement,
  },
  metricText: {
    fontSize: FontSize.sizeLarge,
    fontFamily: FontFamily.familyBold,
    color: colors.slateBlue,
  },
  metricUnit: {
    fontSize: FontSize.sizeSmall,
    fontFamily: FontFamily.familyBold,
    color: colors.greyMidnight,
  },
});

export default GlucoseGraph;
