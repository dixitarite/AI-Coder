import { Routes } from '@angular/router'; 
import { AppLayout } from './app/layout/component/app.layout';
import { LoginComponent } from './app/login/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { AuthGuard } from './app/guards/auth.guard';  

export const appRoutes: Routes = [
    
    { path: 'login', component: LoginComponent },

    {
        path: 'generate',
        component: AppLayout,
        // canActivate: [AuthGuard],  
        children: [
            { path: '', component: DashboardComponent },
            
        ]
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: '**', redirectTo: 'login' }
];
