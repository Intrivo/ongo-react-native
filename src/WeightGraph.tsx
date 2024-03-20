import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import ExpandableButton from './ExpandableButton';
import WeightProgressText from './WeightProgressText';
import ChartDot from './ChartDot';
import colors from './colors';
import { FontFamily, FontSize } from './fonts';
import { getDifferenceInDays, iso8601ToFormatted } from './helpers';
import { HealthData } from './data/HealthMetric';
import { useOnGoApi } from './network';

const MILLISECONDS_OF_DAY = 24 * 3600 * 1000;
const MILLISECONDS_OF_WEEK = 7 * 24 * 3600 * 1000;

interface Points {
  x: number;
  y: number;
}

const WeightGraph = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<HealthData[]>();
  const [goal, setGoal] = useState<{ targetValue: number, initialValue: number }>();
  const api = useOnGoApi();

  useEffect(() => {
    if (data) return;
    const fetchHealthMetric = async () => {
      const res = await api.get('/me');
      const userId = res.data.data.id;
      const journals = await api.get(`/users/${userId}/user_journals`, {
        params: { 'filter[purpose][]': 'weight', 'per_page': 50, 'sort': '-created_at' },
      });
      const healthMetric = journals.data.data.map(
        ({
          health_metrics: {
            data: [d],
          },
        }: {
          health_metrics: { data: { created_at: string; value: string }[] };
        }) => ({
          metric: Number(d.value),
          createdAt: d.created_at,
        })
      );
      const goalRes = await api.get(`/users/${userId}/user_goals`, {
        params: {
          'filter[goal_purpose][]': 'weight',
          'filter[status][]': 'active',
          'sort': '-created_at',
        },
      });
      const { target_value: targetValue, initial_value: initialValue } = goalRes.data.data[0].meta;
      setGoal({ targetValue, initialValue });
      setData(healthMetric);
    };
    fetchHealthMetric();
  }, [api, data]);

  if (!data) return null;

  const dataSet = new Map<string, number>();
  data.forEach(({ createdAt, metric }: HealthData) => {
    dataSet.set(new Date(createdAt).toISOString(), metric);
  });
  const metrics = data.map(({ metric }) => metric).filter((i) => !Number.isNaN(i) && i !== 0);
  const minMetric = Math.min(...metrics);
  const maxMetric = Math.max(...metrics);
  const dates: number[] = [];
  const dataPoints: Points[] = [];
  dataSet.forEach((value, key) => {
    if (!Number.isNaN(value) && value !== 0) {
      dates.push(new Date(key).getTime());
      dataPoints.push({ x: new Date(key).getTime(), y: value });
    }
  });

  const startDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const maxDatePlus6 = new Date(new Date(maxDate).setDate(maxDate.getDate() + 6));
  const rangeInDays = getDifferenceInDays(startDate, maxDatePlus6);
  const getXAxisLabel = (x: number) => {
    const time = x - startDate.getTime();
    if (rangeInDays > 14) {
      return `wk ${Math.floor(time / MILLISECONDS_OF_WEEK + 1)}`;
    }
    return `day ${Math.floor(time / MILLISECONDS_OF_DAY + 1)}`;
  };

  const current = data[0].metric;
  const previous = data.length > 1 ? data[1].metric : data[0].metric;

  const progress = Number(previous) - Number(current);

  const round = (value: number) => Math.round(value * 1e1) / 1e1;

  return (
    <View style={[styles.container, { flex: isExpanded ? 1 : 0 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.cardTitle}>Weight</Text>
          <Text style={styles.cardDescription}>
            updated:{' '}
            {new Date().getTime() - maxDate.getTime() > 24 * 3600 * 1000
              ? iso8601ToFormatted(maxDate, 'MMM d (ha)')
              : iso8601ToFormatted(maxDate, 'h:mma')}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.metricContainer}>
            <Text>
              <Text style={styles.metricText}>{Math.round(Number(current))}</Text>
              <Text style={styles.metricUnit}> lb</Text>
            </Text>
            {current && previous && current !== previous ? (
              <WeightProgressText progress={round(progress)} />
            ) : null}
          </View>
          <ExpandableButton
            isExpanded={isExpanded}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          />
        </View>
      </View>
      {isExpanded && (
        <VictoryChart
          padding={{ bottom: 40, left: 50, right: 70 }}
          height={250}
          domain={{
            x: [startDate.getTime(), maxDatePlus6.getTime()],
            y: [Math.min(minMetric, goal.targetValue), Math.max(maxMetric, goal.initialValue)],
          }}
        >
          <VictoryAxis
            style={{
              axis: { opacity: 0 },
            }}
            standalone={false}
            tickValues={[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              if (rangeInDays > 14) {
                return (
                  i * Math.round(rangeInDays / 7 / 5) * MILLISECONDS_OF_WEEK +
                  startDate.getTime() +
                  3 * MILLISECONDS_OF_DAY
                );
              }
              return i * Math.round(rangeInDays / 5) * MILLISECONDS_OF_DAY + startDate.getTime();
            })}
            tickFormat={(t) => getXAxisLabel(t)}
          />
          <VictoryAxis
            style={{
              axis: { opacity: 0 },
            }}
            dependentAxis
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
            interpolation='natural'
            data={dataPoints}
          />
          <VictoryScatter dataComponent={<ChartDot />} data={dataPoints} />
        </VictoryChart>
      )}
    </View>
  );
};

export default WeightGraph;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 3,
  },
  header: {
    width: '100%',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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

WeightGraph.defaultProps = {
  containerStyle: {},
};
