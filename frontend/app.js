const apiBase = '/api'
let token = localStorage.getItem('sf_token') || ''

function $(sel){ return document.querySelector(sel) }
function show(page){ document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden')); $(page).classList.remove('hidden') }

$('#link-home').addEventListener('click', e=>{ e.preventDefault(); show('#home') })
$('#link-browse').addEventListener('click', e=>{ e.preventDefault(); show('#browse'); loadMovies() })
$('#link-login').addEventListener('click', e=>{ e.preventDefault(); show('#login') })
$('#link-register').addEventListener('click', e=>{ e.preventDefault(); show('#register') })

async function loadMovies(q=''){
  try{
    const url = q? `${apiBase}/search?q=${encodeURIComponent(q)}` : `${apiBase}/movies`
    const headers = token ? { 'Authorization': token } : {}
    const res = await fetch(url, { headers })
    if(res.status === 401){
      alert('Please login first')
      show('#login')
      return
    }
    const data = await res.json()
    renderMovies(data)
  }catch(e){ console.error(e); alert('Failed to load movies') }
}

function renderMovies(movies){
  const container = $('#movies'); container.innerHTML=''
  if(!movies || movies.length===0){ container.innerHTML='<p class="muted">No results</p>'; return }
  movies.forEach(m=>{
    const div = document.createElement('div'); div.className='card'
    div.innerHTML = `
      <img src="${m.poster_url || 'https://via.placeholder.com/300x450'}" alt="${m.title}" />
      <h4>${escapeHtml(m.title)} ${m.year? '('+m.year+')' : ''}</h4>
      <p class="muted">${(m.genre_names||[]).map(escapeHtml).join(', ')}</p>
      <div style="margin-top:8px"><button data-id="${m.id}" class="fav">+ My List</button></div>
    `
    container.appendChild(div)
  })
}

function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])) }

$('#btn-search').addEventListener('click', ()=>{ const q = $('#search').value.trim(); loadMovies(q) })

$('#form-login').addEventListener('submit', async (e)=>{
  e.preventDefault()
  const f = new FormData(e.target)
  const body = { email: f.get('email'), password: f.get('password') }
  const res = await fetch(`${apiBase}/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
  if(res.ok){ const d = await res.json(); token = d.token; localStorage.setItem('sf_token', token); alert('Logged in'); show('#browse'); loadMovies() }
  else{ const err = await res.json().catch(()=>({})); alert('Login failed: ' + (err.error || res.statusText)) }
})

$('#form-register').addEventListener('submit', async (e)=>{
  e.preventDefault()
  const f = new FormData(e.target)
  const body = { name: f.get('name'), email: f.get('email'), password: f.get('password') }
  const res = await fetch(`${apiBase}/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
  if(res.ok){ alert('Registered — now log in'); show('#login') } else { const err = await res.json().catch(()=>({})); alert('Register failed: ' + (err.error || res.statusText)) }
})

document.addEventListener('click', async (e)=>{
  if(e.target.classList.contains('fav')){
    const id = e.target.dataset.id
    if(!token){ alert('Please log in to add favorites'); show('#login'); return }
    const res = await fetch(`${apiBase}/favorites`, { method:'POST', headers: {'Content-Type':'application/json', 'Authorization': token }, body: JSON.stringify({ movieId: id }) })
    if(res.ok) alert('Added to My List')
    else { const err = await res.json().catch(()=>({})); alert('Failed — ' + (err.error || res.statusText)) }
  }
})

show('#home')