import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutLayout } from './about-layout';

describe('AboutLayout', () => {
  let component: AboutLayout;
  let fixture: ComponentFixture<AboutLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
