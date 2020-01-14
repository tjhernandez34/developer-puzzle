import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { debounceTime, map, filter } from 'rxjs/operators';
import { StockQuery } from '../interfaces/stock-query.interface';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit, OnDestroy {
  public period: string;
  public quotes$: Observable<(string | number)[][]>;
  public stockPickerForm: FormGroup;
  public subscription: Subscription;
  public symbol: string;
  public timePeriods: object[];

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.subscription = new Subscription();
    this.quotes$ = this.priceQuery.priceQueries$;
    this.timePeriods = [
      { viewValue: 'All available data', value: 'max' },
      { viewValue: 'Five years', value: '5y' },
      { viewValue: 'Two years', value: '2y' },
      { viewValue: 'One year', value: '1y' },
      { viewValue: 'Year-to-date', value: 'ytd' },
      { viewValue: 'Six months', value: '6m' },
      { viewValue: 'Three months', value: '3m' },
      { viewValue: 'One month', value: '1m' }
    ];
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      period: [null, Validators.required]
    });
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.stockPickerForm.valueChanges
        .pipe(
          debounceTime(200),
          filter(() => this.stockPickerForm.valid),
          map((query: StockQuery) => this.fetchQuote(query))
        )
        .subscribe()
    );
  }

  public fetchQuote(query: StockQuery): void {
    this.priceQuery.fetchQuote(query.symbol, query.period);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
