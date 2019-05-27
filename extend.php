<?php

/*
 * This file is part of dvwzj-dev/flarum-ext-anonymous.
 *
 * Copyright (c) 2019 dvwzj.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Dvwzj\Anonymous;

use Flarum\Extend;
use Flarum\Frontend\Document;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\SetCookie;
use Dvwzj\Anonymous\AnonymousAuthController;

use Psr\Http\Message\ServerRequestInterface as Request;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less'),
    new Extend\Locales(__DIR__ . '/resources/locale'),
    (new Extend\Routes('forum'))
        ->get('/auth/anonymous', 'auth.anonymous', AnonymousAuthController::class),
    (new Extend\Frontend('forum'))
        ->content(function(Document $document, Request $request) {
            $actor = $request->getAttribute('actor');
            if ($actor->isGuest()) {
                $apiDocument = $document->getForumApiDocument();
                $client = new Client([
                    'cookies' => true,
                    'verify' => false,
                    'headers' => $request->getHeaders()
                ]);
                $res = $client->get($apiDocument['data']['attributes']['baseUrl'].'/auth/anonymous');
                
                preg_match('/\({.*}\)/', $res->getBody()->getContents(), $matches);
                $data = json_decode(substr($matches[0], 1, -1));
                if (!isset($data->loggedIn)) {
                    $res = $client->post($apiDocument['data']['attributes']['baseUrl'].'/register', [
                        'form_params' => [
                            'token' => $data->token,
                            'username' => $data->username,
                            'email' => $data->email
                        ]
                    ]);
                }
                foreach($res->getHeader('set-cookie') as $cookie) {                        
                    $cookie = SetCookie::fromString($cookie);
                    setcookie($cookie->getName(), $cookie->getValue(), $cookie->getExpires(), $cookie->getPath(), $cookie->getDomain(), $cookie->getSecure(), $cookie->getHttpOnly());
                }
                $res = $client->get($apiDocument['data']['attributes']['baseUrl']);
                $html = $res->getBody()->getContents();
                preg_match('/load\(({.*})\)/', $html, $matches);
                $payload = json_decode($matches[1], true);
                $document->payload = $payload;

                preg_match_all('/<link rel="stylesheet" href="(.*)">/', $html, $matches);
                $document->css = [];
                foreach ($matches[1] as $css) {
                    $document->css[] = $css;
                }
                preg_match_all('/<script src="(.*)"><\/script>/', $html, $matches);
                $document->js = [];
                foreach ($matches[1] as $js) {
                    $document->js[] = $js;
                }
            }
        })
];
