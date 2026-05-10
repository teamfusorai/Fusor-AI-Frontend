import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { AnalyticsResponse, TopQuery, TopIntent } from 'src/app/core/models/dashboard.model';
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

    // Line chart data (aggregate daily → monthly)
    const monthlyData = this.aggregateMonthly(data.convo_trend || []);
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

    // Top intents
    this.intents = data.top_intents || [];
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
            stepSize: 5,
            precision: 0,
            autoSkip: false
          },
          min: 0,
          suggestedMax: 40,
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
          suggestedMax: 0.10,
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

  private aggregateMonthly(trend: any[]): { labels: string[]; counts: number[]; costs: number[] } {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const countMap = new Map<number, number>();
    const costMap = new Map<number, number>();

    for (const item of trend) {
      const monthIdx = new Date(item.day).getMonth();
      countMap.set(monthIdx, (countMap.get(monthIdx) || 0) + item.count);
      costMap.set(monthIdx, (costMap.get(monthIdx) || 0) + (item.cost || 0));
    }

    if (countMap.size > 0 || costMap.size > 0) {
      const labels: string[] = [];
      const counts: number[] = [];
      const costs: number[] = [];
      for (let i = 0; i < 12; i++) {
        labels.push(months[i]);
        counts.push(countMap.get(i) || 0);
        costs.push(costMap.get(i) || 0);
      }
      return { labels, counts, costs };
    }

    return { labels: months, counts: new Array(12).fill(0), costs: new Array(12).fill(0) };
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
