import { Routes } from '@angular/router';
import { HomeLayout } from './layouts/home-layout/home-layout';

export const routes: Routes = [
    {
        path: '', children: [
            { path: '', pathMatch: 'full', redirectTo: '/home' },
            { path: 'home', component: HomeLayout }
        ]
    }
];
