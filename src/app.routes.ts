import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { LoginComponent } from './app/login/login.component';
// import other components as needed...

export const appRoutes: Routes = [
    // 👇 Login route OUTSIDE the layout
    { path: '', component: LoginComponent },
    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'dashboard', redirectTo: 'dashboard', pathMatch: 'full' }, // example
        ]
    }
];
