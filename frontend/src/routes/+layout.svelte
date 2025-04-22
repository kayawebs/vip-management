<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<div class="app">
  <header>
    <div class="logo">
      <h1>SPA店管理平台</h1>
    </div>
    <button class="menu-toggle" on:click={toggleMenu}>
      <span class="menu-icon">☰</span>
    </button>
  </header>

  <div class="content-wrapper">
    <nav class={isMenuOpen ? 'open' : ''}>
      <ul>
        <li><a href="/" on:click={closeMenu}>首页</a></li>
        <li><a href="/vip" on:click={closeMenu}>VIP管理</a></li>
        <li><a href="/projects" on:click={closeMenu}>项目管理</a></li>
        <li><a href="/technicians" on:click={closeMenu}>技师管理</a></li>
        <li><a href="/reports" on:click={closeMenu}>报表管理</a></li>
        <li><a href="/converter" on:click={closeMenu}>汇率换算</a></li>
      </ul>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</div>

<style>
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background-color: #333;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  nav {
    width: 200px;
    background-color: #f5f5f5;
    padding: 1rem 0;
    overflow-y: auto;
  }

  nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  nav li {
    margin-bottom: 0.5rem;
  }

  nav a {
    display: block;
    padding: 0.75rem 1rem;
    color: #333;
    text-decoration: none;
    transition: background-color 0.2s;
  }

  nav a:hover {
    background-color: #e0e0e0;
  }

  main {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
    }

    nav {
      position: fixed;
      top: 60px;
      left: -200px;
      height: calc(100% - 60px);
      transition: left 0.3s;
      z-index: 10;
    }

    nav.open {
      left: 0;
    }

    main {
      padding: 1rem;
    }
  }
</style> 