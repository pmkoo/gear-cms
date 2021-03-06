<?php
    $base = '../';

    include($base.'gear/bootstrap.php');

    theme::addCSS('https://cdn.jsdelivr.net/animatecss/3.5.2/animate.min.css');
    theme::addCSS('https://cdn.jsdelivr.net/jquery.ui/1.11.4/jquery-ui.structure.min.css');
    theme::addCSS(url::assets('css/style.css'));

    theme::addJS('https://cdn.jsdelivr.net/jquery/3.1.1/jquery.min.js');
    theme::addJS('https://cdn.jsdelivr.net/jquery.ui/1.11.4/jquery-ui.min.js');
    theme::addJS('https://cdn.jsdelivr.net/lodash/4.17.4/lodash.min.js');
    theme::addJS('https://cdn.jsdelivr.net/vue/2.2.1/vue.min.js');
    theme::addJS('https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.min.js');
    theme::addJS(url::assets('js/form.js'));
    theme::addJS(url::assets('js/session.js'));
    theme::addJS(url::assets('js/layout.js'));
    theme::addJS(url::assets('js/app.js'));

    userPerm::add('content[index]', lang::get('content[index]'));
    userPerm::add('content[media]', lang::get('content[media]'));
    userPerm::add('user[index]', lang::get('user[index]'));
    userPerm::add('user[index][add]', lang::get('user[index][add]'));
    userPerm::add('user[index][edit]', lang::get('user[index][edit]'));
    userPerm::add('user[index][delete]', lang::get('user[index][delete]'));
    userPerm::add('user[groups]', lang::get('user[groups]'));
    userPerm::add('extensions[index]', lang::get('extensions[index]'));

    ob_start();

    new application('admin');

    $content = ob_get_contents();

    ob_end_clean();

    config::add('content', $content);

    if(ajax::is()) {

        ajax::messages();
        ajax::setMenu();

        echo ajax::getReturn();

        exit();

    }

    if(user::loggedIn()) {

        admin::addMenu(lang::get('dashboard'), 'dashboard', 'stats-bars');
        admin::addSubmenu(lang::get('overview'), 'index', 'dashboard');
        admin::addSubmenu(lang::get('logs'), 'logs', 'dashboard');

        admin::addMenu(lang::get('content'), 'content', 'images');
        admin::addSubmenu(lang::get('pages'), 'index', 'content');
        admin::addSubmenu(lang::get('grid_templates'), 'grid', 'content', false);
        admin::addSubmenu(lang::get('menus'), 'menus', 'content');
        admin::addSubmenu(lang::get('media'), 'media', 'content');

        admin::addMenu(lang::get('user'), 'user', 'person');
        admin::addSubmenu(lang::get('list'), 'index', 'user');
        admin::addSubmenu(lang::get('user_groups'), 'groups', 'user');

        admin::addMenu(lang::get('extensions'), 'extensions', 'fork-repo');
        admin::addSubmenu(lang::get('plugins'), 'index', 'extensions');
        admin::addSubmenu(lang::get('blocks'), 'blocks', 'extensions');

        admin::addMenu(lang::get('system'), 'system', 'settings');
        admin::addSubmenu(lang::get('settings'), 'index', 'system');
        admin::addSubmenu(lang::get('theme'), 'theme', 'system');

        include(dir::view('head.php'));
        include(dir::view('header.php'));
        echo config::get('content');
        include(dir::view('footer.php'));

    } else {

        admin::$page = lang::get('login');

        include(dir::view('head.php'));
        echo config::get('content');
        include(dir::view('footer.php'));

    }

?>
