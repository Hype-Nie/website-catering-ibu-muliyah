<?php

declare(strict_types=1);

namespace App\Models\Concerns;

trait HasLegacyColumns
{
    public function fill(array $attributes)
    {
        $map = defined('static::LEGACY_MAP') ? static::LEGACY_MAP : [];
        $mapped = [];
        foreach ($attributes as $key => $val) {
            $mapped[$map[$key] ?? $key] = $val;
        }

        return parent::fill($mapped);
    }

    public function getAttribute($key)
    {
        $map = defined('static::LEGACY_MAP') ? static::LEGACY_MAP : [];

        return parent::getAttribute($map[$key] ?? $key);
    }

    public function setAttribute($key, $value)
    {
        $map = defined('static::LEGACY_MAP') ? static::LEGACY_MAP : [];

        return parent::setAttribute($map[$key] ?? $key, $value);
    }
}
