<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Auth::provider('eloquent', function ($app, array $config) {
            return new class($app['hash'], $config['model']) extends EloquentUserProvider
            {
                public function retrieveByCredentials(array $credentials)
                {
                    $credentials = array_filter(
                        $credentials,
                        fn ($key) => ! str_contains($key, 'password') && $key !== 'kata_sandi',
                        ARRAY_FILTER_USE_KEY
                    );

                    return parent::retrieveByCredentials($credentials);
                }

                public function validateCredentials(UserContract $user, array $credentials)
                {
                    $plain = $credentials['kata_sandi'] ?? $credentials['password'] ?? null;
                    if (is_null($plain) || is_null($hashed = $user->getAuthPassword())) {
                        return false;
                    }

                    return $this->hasher->check($plain, $hashed);
                }
            };
        });
    }
}
