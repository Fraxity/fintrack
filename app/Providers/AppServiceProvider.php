<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Limit request bursts per user or IP address.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('app', function (Request $request): array {
            $ip = (string) $request->ip();
            $limits = [];

            if ($request->routeIs('register.store')) {
                $limits[] = Limit::perMinute(5)->by('register:'.$ip);
            }

            if ($request->routeIs('password.email')) {
                $limits[] = Limit::perMinute(5)->by('password-email:'.$ip);
            }

            $user = $request->user();

            $limits[] = $user !== null
                ? Limit::perMinute(120)->by('user:'.$user->getAuthIdentifier())
                : Limit::perMinute(60)->by('ip:'.$ip);

            return $limits;
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
