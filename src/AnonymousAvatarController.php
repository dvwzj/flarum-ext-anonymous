<?php
/*
 * This file is part of Dvwzj\Anonymous.
 *
 * (c) dvwzj <iguphai_@msn.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace Dvwzj\Anonymous;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Api\Controller\UploadAvatarController;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Intervention\Image\ImageManager;

class AnonymousAvatarController extends UploadAvatarController
{
  /**
   * {@inheritdoc}
   */
  protected function data(ServerRequestInterface $request, Document $document)
  {
    $file = array_get($request->getUploadedFiles(), 'anonymous/avatar');
    $file->moveTo(public_path('assets/avatars/anonymous-avatar.png'));
  }
}