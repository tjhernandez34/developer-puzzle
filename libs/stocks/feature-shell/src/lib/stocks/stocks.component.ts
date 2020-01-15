import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { DateRangeValidator } from './validators/date-range.validator';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stockPickerForm: FormGroup;
  symbol: string;
  period: string;
  minDate: Date;
  maxDate: Date;

  quotes$ = this.priceQuery.priceQueries$;

  timePeriods = [
    { viewValue: 'All available data', value: 'max' },
    { viewValue: 'Five years', value: '5y' },
    { viewValue: 'Two years', value: '2y' },
    { viewValue: 'One year', value: '1y' },
    { viewValue: 'Year-to-date', value: 'ytd' },
    { viewValue: 'Six months', value: '6m' },
    { viewValue: 'Three months', value: '3m' },
    { viewValue: 'One month', value: '1m' }
  ];

  get shouldDisplayDateError(): boolean {
    return (
      this.stockPickerForm.errors && this.stockPickerForm.errors.fromAfterTo
    );
  }

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    // according to API documentation the oldest records will be 15 years old
    // https://iexcloud.io/docs/api/#charts
    const maxAgeOfAPIData = 15;

    this.maxDate = new Date(year, month, date);
    this.minDate = new Date(year - maxAgeOfAPIData, month, date);

    this.stockPickerForm = fb.group(
      {
        symbol: [null, Validators.required],
        to: [today, [Validators.required]],
        from: [today, [Validators.required]]
      },
      { validators: DateRangeValidator }
    );
  }

  ngOnInit() {}

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      const { symbol, to, from } = this.stockPickerForm.value;
      const necessaryPeriod = this.setPeriod(from);

      this.priceQuery.fetchQuote(symbol, necessaryPeriod, from, to);
    }
  }

  private setPeriod(from: Date): string {
    let desiredSearchPeriod = 'max';
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    const fiveYearsAgo = new Date(year - 5, month, date);
    const twoYearsAgo = new Date(year - 2, month, date);
    const oneYearAgo = new Date(year - 1, month, date);
    const sixMonthsAgo = new Date(year, month, date);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const threeMonthsAgo = new Date(year, month, date);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const oneMonthAgo = new Date(year, month, date);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    if (fiveYearsAgo <= from) {
      desiredSearchPeriod = '5y';
    }

    if (twoYearsAgo <= from) {
      desiredSearchPeriod = '2y';
    }

    if (oneYearAgo <= from) {
      desiredSearchPeriod = '1y';
    }

    if (sixMonthsAgo <= from) {
      desiredSearchPeriod = '6m';
    }

    if (threeMonthsAgo <= from) {
      desiredSearchPeriod = '3m';
    }

    if (oneMonthAgo <= from) {
      desiredSearchPeriod = '1m';
    }

    return desiredSearchPeriod;
  }
}
