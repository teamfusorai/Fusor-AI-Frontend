import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { AnalyticsResponse, ConvoTrendItem, TopIntent, TopQuery } from 'src/app/core/models/dashboard.model';
import { ChatbotSummary } from 'src/app/core/models/chatbot.model';

interface KpiCard {
  icon: string;
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  highlighted: boolean;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Filter state
  selectedBotId$ = new BehaviorSubject<string | null>(null);
  selectedDateRange$ = new BehaviorSubject<string>('last_30_days');

  // UI state
  isLoading = true;
  isEmptyState = false;
  userId = '';

  // Dropdown data
  chatbots: ChatbotSummary[] = [];
  botOptions: any[] = [];
  selectedBot: string | null = null;

  dateRangeOptions = [
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'Last 90 Days', value: 'last_90_days' },
    { label: 'All Time', value: 'all_time' }
  ];
  selectedDateRange = 'last_30_days';

  // Data
  kpiCards: KpiCard[] = [];
  trendChartData: any = {};
  trendChartOptions: any = {};
  costChartData: any = {};
  costChartOptions: any = {};
  intentChartData: any = {};
  intentChartOptions: any = {};
  intents: TopIntent[] = [];
  maxIntentCount = 1;
  topQueries: TopQuery[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('user_id') || 'test_user_id';

    // Load chatbot list for dropdown
    this.analyticsService.getChatbotsList(this.userId).pipe(
      catchError(() => of([]))
    ).subscribe(bots => {
      this.chatbots = bots;
      this.botOptions = [
        { label: 'All Chatbots', value: null },
        ...bots.map(b => ({ label: b.chatbot_name, value: b.bot_id }))
      ];
    });

    // Reactive data stream
    combineLatest([this.selectedBotId$, this.selectedDateRange$]).pipe(
      tap(() => { this.isLoading = true; this.isEmptyState = false; }),
      switchMap(([botId]) =>
        this.analyticsService.getAnalyticsDashboard(this.userId, botId || undefined).pipe(
          catchError(() => of(null))
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.isLoading = false;
      if (!data) {
        this.processAnalyticsData({
          total_conversations: 0,
          unique_users: 0,
          avg_latency: 0,
          total_cost: 0,
          convo_trend: [],
          top_intents: [],
          top_queries: []
        });
        return;
      }
      this.processAnalyticsData(data);
    });

    this.initChartOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBotChange(botId: string | null): void {
    this.selectedBotId$.next(botId);
  }

  onDateRangeChange(range: string): void {
    this.selectedDateRange$.next(range);
  }

  private processAnalyticsData(data: AnalyticsResponse): void {
    // KPI Cards
    this.kpiCards = [
      {
        icon: 'pi pi-comments',
        value: this.formatNumber(data.total_conversations),
        label: 'Total Conversations',
        change: '',
        isPositive: true,
        highlighted: false
      },
      {
        icon: 'pi pi-users',
        value: this.formatNumber(data.unique_users),
        label: 'Unique Users',
        change: '',
        isPositive: true,
        highlighted: false
      },
      {
        icon: 'pi pi-clock',
        value: this.formatLatency(data.avg_latency),
        label: 'Avg Response Time',
        change: '',
        isPositive: true,
        highlighted: false
      },
      {
        icon: 'pi pi-dollar',
        value: this.formatCost(data.total_cost || 0),
        label: 'AI Cost Usage',
        change: '',
        isPositive: true,
        highlighted: true
      }
    ];

    // Rolling buckets over the trend window (avoids piling years into one “January” bar)
    const monthlyData = this.aggregateTrendRollingBuckets(data.convo_trend || []);
    this.trendChartData = {
      labels: monthlyData.labels,
      datasets: [{
        label: 'Conversations',
        data: monthlyData.counts,
        fill: true,
        borderColor: '#0a0a0a',
        backgroundColor: 'rgba(10, 10, 10, 0.05)',
        tension: 0.4, // This gives the smooth curve
        pointBackgroundColor: '#0a0a0a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        clip: false // Prevent dots and lines at exactly 0 from being cut off
      }]
    };

    this.costChartData = {
      labels: monthlyData.labels,
      datasets: [{
        label: 'Cost (USD)',
        data: monthlyData.costs,
        fill: true,
        borderColor: '#0a0a0a',
        backgroundColor: 'rgba(10, 10, 10, 0.05)',
        tension: 0.4,
        pointBackgroundColor: '#0a0a0a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        clip: false
      }]
    };

    const maxCount = Math.max(...monthlyData.counts, 1);
    const maxCostVal = Math.max(...monthlyData.costs, 0.0001);
    this.applyDynamicChartScales(maxCount, maxCostVal);

    // Top intents — cap radar segments so the spider chart stays readable
    const rawIntents = data.top_intents || [];
    this.intents = rawIntents.slice(0, 6).map(i => ({
      ...i,
      name: i.name.length > 26 ? `${i.name.slice(0, 24).trim()}…` : i.name,
    }));
    this.maxIntentCount = this.intents.length > 0
      ? Math.max(...this.intents.map(i => i.count))
      : 1;

    // Radar Chart Data for Intents
    this.intentChartData = {
      labels: this.intents.map(i => i.name),
      datasets: [
        {
          label: 'Queries',
          backgroundColor: 'rgba(10, 10, 10, 0.1)',
          borderColor: '#0a0a0a',
          pointBackgroundColor: '#0a0a0a',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#0a0a0a',
          data: this.intents.map(i => i.count)
        }
      ]
    };

    this.intentChartOptions = {
      ...this.intentChartOptions,
      scales: {
        r: {
          angleLines: { color: '#d4d4d4' },
          grid: { color: '#e0e0e0' },
          pointLabels: {
            font: { family: 'Inter', size: this.intents.length > 5 ? 10 : 12 },
            color: '#737373'
          },
          ticks: {
            display: false,
            min: 0,
            stepSize: 1
          }
        }
      }
    };

    // Top queries (Slice to 5 so it immediately truncates even if backend sends 10)
    this.topQueries = (data.top_queries || []).slice(0, 5);
  }

  private initChartOptions(): void {
    this.trendChartOptions = {
      responsive: true,
      maintainAspectRatio: false, // Crucial for stretching
      layout: {
        padding: {
          bottom: 5,
          top: 5, // Reduced padding to bring chart closer to title (clipping handled by clip: false)
          left: 5,
          right: 5
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#000',
          titleFont: { family: 'Inter', size: 13, weight: '600' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            label: (context: any) => ` ${context.parsed.y} Conversations`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#737373',
            font: { family: 'Inter', size: 12 },
            padding: 5,
            align: 'center'
          },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#F5F5F5',
            drawTicks: false
          },
          ticks: {
            color: '#737373',
            font: { family: 'Inter', size: 11 },
            padding: 10,
            precision: 0,
            autoSkip: true,
            maxTicksLimit: 8
          },
          min: 0,
          border: { display: false }
        }
      }
    };

    this.costChartOptions = {
      ...this.trendChartOptions,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#000',
          titleFont: { family: 'Inter', size: 13, weight: '600' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            label: (context: any) => ` Cost: $${context.parsed.y.toFixed(4)}`
          }
        }
      },
      scales: {
        x: this.trendChartOptions.scales.x,
        y: {
          beginAtZero: true,
          grid: { color: '#F5F5F5', drawTicks: false },
          ticks: {
            color: '#737373',
            font: { family: 'Inter', size: 11 },
            padding: 10,
            callback: (value: any) => '$' + Number(value).toFixed(2),
            autoSkip: true,
            maxTicksLimit: 5
          },
          min: 0,
          border: { display: false }
        }
      }
    };

    this.intentChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#000',
          titleFont: { family: 'Inter', size: 13, weight: '600' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
        }
      },
      scales: {
        r: {
          angleLines: { color: '#d4d4d4' },
          grid: { color: '#e0e0e0' },
          pointLabels: {
            font: { family: 'Inter', size: 12 },
            color: '#737373'
          },
          ticks: {
            display: false, // hide the numbers on the spider web
            min: 0,
            stepSize: 1
          }
        }
      }
    };
  }

  /**
   * Bin daily trend rows into equal time buckets between first and last day (smooth line / cost curves).
   */
  private aggregateTrendRollingBuckets(trend: ConvoTrendItem[]): { labels: string[]; counts: number[]; costs: number[] } {
    const fallbackLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (!trend?.length) {
      return { labels: fallbackLabels, counts: new Array(12).fill(0), costs: new Array(12).fill(0) };
    }

    const sorted = [...trend].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    const tMin = new Date(sorted[0].day).getTime();
    const tMax = new Date(sorted[sorted.length - 1].day).getTime();
    const span = Math.max(tMax - tMin, 86400000);
    const buckets = 12;
    const bucketSpan = span / buckets;

    const counts = new Array(buckets).fill(0);
    const costs = new Array(buckets).fill(0);
    const labels: string[] = [];

    for (let i = 0; i < buckets; i++) {
      const mid = new Date(tMin + (i + 0.5) * bucketSpan);
      labels.push(
        mid.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
    }

    for (const item of sorted) {
      const t = new Date(item.day).getTime();
      let idx = Math.floor((t - tMin) / bucketSpan);
      if (idx >= buckets) {
        idx = buckets - 1;
      }
      if (idx < 0) {
        idx = 0;
      }
      counts[idx] += item.count;
      costs[idx] += item.cost || 0;
    }

    return { labels, counts, costs };
  }

  private applyDynamicChartScales(maxCount: number, maxCostVal: number): void {
    const yTrend = this.trendChartOptions?.scales?.y as Record<string, unknown> | undefined;
    if (yTrend) {
      yTrend['suggestedMax'] = Math.ceil(maxCount * 1.12);
      const ticks = yTrend['ticks'] as Record<string, unknown> | undefined;
      if (ticks) {
        delete ticks['stepSize'];
        ticks['maxTicksLimit'] = 8;
        ticks['autoSkip'] = true;
      }
    }

    const yCost = this.costChartOptions?.scales?.y as Record<string, unknown> | undefined;
    if (yCost) {
      const padded = maxCostVal <= 0 ? 0.01 : maxCostVal * 1.18;
      yCost['suggestedMax'] = Math.ceil(padded * 1000) / 1000;
      const cticks = yCost['ticks'] as Record<string, unknown> | undefined;
      if (cticks) {
        cticks['maxTicksLimit'] = 6;
      }
    }
  }

  getIntentBarWidth(count: number): string {
    return Math.max((count / this.maxIntentCount) * 100, 5) + '%';
  }

  private formatNumber(num: number): string {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return String(num);
  }

  private formatLatency(ms: number): string {
    if (!ms || ms === 0) return '0s';
    return (ms / 1000).toFixed(1) + 's';
  }

  private formatCost(cost: number): string {
    if (!cost || cost === 0) return '$0.00';
    if (cost < 0.01) return '< $0.01';
    return '$' + cost.toFixed(2);
  }
}
