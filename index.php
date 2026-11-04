<?php
/*
 * Front controller: every page request comes through here (see .htaccess).
 *   backend/bootstrap.php  paths, config, helpers, security, data store, plugins
 *   frontend/layout.php    shared <head>, header, footer and page components
 *   backend/router.php     maps the URL to a page file
 */
require __DIR__ . '/backend/bootstrap.php';
require FRONTEND_DIR . '/layout.php';
require BACKEND_DIR . '/router.php';
