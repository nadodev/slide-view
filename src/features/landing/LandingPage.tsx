import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Download,
  MonitorIcon,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

const features = [
  {
    title: "Markdown puro",
    description:
      "Arraste seus .md, mantenha o versionamento do repo e veja o slide nascer em tempo real.",
    icon: Upload,
  },
  {
    title: "Modo apresentador",
    description:
      "Notas privadas, timer e preview do próximo slide em um painel que lembra o backstage da Vercel.",
    icon: MonitorIcon,
  },
  {
    title: "Destaque de código",
    description:
      "Syntax highlight escuro com contraste perfeito para demos técnicas.",
    icon: Sparkles,
  },
  {
    title: "Exportação segura",
    description: "Compartilhe decks em HTML estático ou Markdown consolidado.",
    icon: Download,
  },
  {
    title: "Playlists de slides",
    description: "Agrupe apresentações para squads e mantenha consistência.",
    icon: ShieldCheck,
  },
  {
    title: "Atalhos shadcn/ui",
    description:
      "Interações suaves e padrões familiares para quem ama o ecossistema shadcn.",
    icon: ArrowRight,
  },
];

const workflow = [
  {
    tag: "1. Importar",
    title: "Selecione seus arquivos Markdown",
    copy: "Upload direto do repositório ou do desktop. Detectamos metadados e transformamos headings em slides.",
  },
  {
    tag: "2. Orquestrar",
    title: "Reordene, duplique, combine",
    copy: "Drag and drop fluido, estados salvos automaticamente e histórico para experimentar sem medo.",
  },
  {
    tag: "3. Apresentar",
    title: "Modo palco + apresentador",
    copy: "Compartilhe a visão pública enquanto controla notas, timer e próximo slide em uma aba privada.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 via-25% to-[#0a0a0a] to-20% z-10" />

        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute inset-y-0 w-px bg-gradient-to-b from-white/[0.15] via-white/[0.08] via-10% to-white/0 to-20%"
              style={{ left: `${i * 15}%` }}
            />
          ))}
        </div>

        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute inset-x-0 h-px bg-gradient-to-r from-white/0 via-white/[0.05] to-white/0"
              style={{
                top: `${i * 5.66}%`,
                opacity: Math.max(0, 1 - (i / 15) * 1.8)
              }}
            />
          ))}
        </div>

        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-white/30 via-white/15 via-20% to-white/0 to-45%" />

        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] animate-pulse"
          style={{ animationDuration: '4s' }} />
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-purple-600/8 blur-[100px] animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute left-1/3 top-40 h-64 w-64 rounded-full bg-cyan-600/6 blur-[80px] animate-pulse"
          style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
        {/* Linhas decorativas do header - mais visíveis */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Glow sutil no topo do header */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-sm" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 relative">
          {/* Linhas verticais laterais do header */}
          <div className="absolute inset-y-0 left-6 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-y-0 right-6 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black border border-white/20 shadow-lg shadow-white/10">
              ▲
            </div>
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              SlideMD
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a className="transition hover:text-white relative group" href="#features">
              Recursos
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-purple-400 transition-all group-hover:w-full" />
            </a>
            <a className="transition hover:text-white relative group" href="#workflow">
              Fluxo
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-purple-400 transition-all group-hover:w-full" />
            </a>
            <a className="transition hover:text-white relative group" href="#roadmap">
              Roadmap
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-purple-400 transition-all group-hover:w-full" />
            </a>
          </nav>


          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white hover:bg-white/5"
              onClick={() => navigate("/login")}
            >
              Entrar
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90 hover:shadow-xl shadow-lg shadow-white/20"
              onClick={() => navigate("/register")}
            >
              Criar conta grátis
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-32 relative">
          {/* Linha horizontal decorativa com glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-sm" />

          <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] items-center">
            {/* Linha vertical entre colunas - menos visível */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent hidden lg:block" />

            <div className="space-y-8 relative">
              {/* Efeito de spotlight sutil */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.07] transition-all">
                <Sparkles size={16} className="text-blue-400 animate-pulse" style={{ animationDuration: '3s' }} />
                Markdown para quem apresenta como pro
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
                  Landing page dark em{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '3s' }}>
                    Tailwind
                  </span>{" "}
                  com o brilho SaaS da Vercel.
                </h1>
                <p className="text-xl text-white/60 leading-relaxed">
                  Construa, ajuste e apresente slides a partir de arquivos Markdown.
                  Visual limpo, micro animações shadcn/ui e foco em storytelling com
                  código.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-white/90 hover:scale-105 shadow-lg shadow-white/20 hover:shadow-white/30"
                  onClick={() => navigate("/app")}
                >
                  Começar agora
                  <ArrowRight size={18} />
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-base font-medium text-white/80 transition hover:border-white/40 hover:bg-white/5"
                  onClick={() => navigate("/app")}
                >
                  Ver demo
                </button>
              </div>

              {/* Stats com linhas e animação */}
              <div className="grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden mt-12">
                <div className="bg-[#0a0a0a] p-6 relative group hover:bg-[#0f0f0f] transition">
                  <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
                  <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-blue-400/30 to-transparent blur-sm" />
                  <p className="text-3xl font-bold text-white">+3k</p>
                  <p className="text-xs uppercase tracking-wider text-white/40 mt-1">
                    Slides gerados
                  </p>
                </div>
                <div className="bg-[#0a0a0a] p-6 relative group hover:bg-[#0f0f0f] transition">
                  <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                  <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-purple-400/30 to-transparent blur-sm" />
                  <p className="text-3xl font-bold text-white">2 min</p>
                  <p className="text-xs uppercase tracking-wider text-white/40 mt-1">
                    Tempo médio
                  </p>
                </div>
                <div className="bg-[#0a0a0a] p-6 relative group hover:bg-[#0f0f0f] transition">
                  <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-green-500/50 to-transparent" />
                  <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-green-400/30 to-transparent blur-sm" />
                  <p className="text-3xl font-bold text-white">0 stress</p>
                  <p className="text-xs uppercase tracking-wider text-white/40 mt-1">
                    Setup
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Card com animação */}
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-6 backdrop-blur-sm relative overflow-hidden hover:border-white/20 transition-all group">
                {/* Linhas decorativas do card */}
                <div className="absolute top-0 left-0 w-32 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
                <div className="absolute top-0 left-0 w-32 h-px bg-gradient-to-r from-blue-400/30 to-transparent blur-sm" />
                <div className="absolute top-0 right-0 h-32 w-px bg-gradient-to-b from-blue-500/30 to-transparent" />
                <div className="absolute bottom-0 right-0 w-32 h-px bg-gradient-to-l from-purple-500/50 to-transparent" />
                <div className="absolute bottom-0 right-0 w-32 h-px bg-gradient-to-l from-purple-400/30 to-transparent blur-sm" />

                {/* Glow de hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />

                <div className="rounded-xl border border-white/10 bg-[#050505] p-4 relative">
                  <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse" style={{ animationDuration: '2s' }} />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
                  </div>

                  <div className="space-y-3 mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-4 font-mono text-sm text-white/80">
                    <p className="text-blue-400"># Roadmap SlideMD</p>
                    <p>- ✅ Conversor Markdown → Deck</p>
                    <p>- ✅ Presenter view estilo Vercel</p>
                    <p>- 🚧 Export HTML estático</p>
                    <p>- ✨ Transições shadcn/ui</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-px bg-white/10 rounded-lg overflow-hidden">
                  <div className="bg-[#050505] p-4 hover:bg-[#0a0a0a] transition">
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Slide atual
                    </p>
                    <p className="mt-2 text-sm text-white/90">
                      Design tokens: aplicando na prática.
                    </p>
                  </div>
                  <div className="bg-[#050505] p-4 hover:bg-[#0a0a0a] transition">
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Próximo
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      Fluxo de revisão em squad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="mx-auto max-w-7xl px-6 py-24 relative"
        >
          {/* Linhas decorativas da seção - menos visíveis */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="space-y-6 mb-16">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Recursos principais
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              Um toolkit escuro com cara de palco.
            </h2>
            <p className="text-lg text-white/60 max-w-2xl">
              Cartões com bordas suaves, brilhos sutis e icons minimalistas —
              tudo com utilitários Tailwind e vibe SaaS.
            </p>
          </div>

          <div className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group relative bg-[#0a0a0a]/95 p-8 transition hover:bg-[#0f0f0f]"
              >
                {/* Linhas internas do card com glow */}
                <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-blue-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Glow no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 opacity-0 group-hover:opacity-5 transition-opacity" />

                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                  <Icon size={20} />
                </div>

                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{description}</p>

                <div className="mt-6 flex items-center text-sm text-white/50 group-hover:text-white/80 transition">
                  Saiba mais
                  <ArrowRight
                    className="ml-2 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all"
                    size={16}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section
          id="workflow"
          className="mx-auto max-w-7xl px-6 py-24 relative"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            {/* Linha vertical entre colunas - quase invisível */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/3 to-transparent hidden lg:block" />

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Fluxo de trabalho
                </p>
                <h2 className="text-4xl font-bold">
                  Do Markdown ao palco em três pulsos.
                </h2>
                <p className="text-lg text-white/60">
                  Estrutura modular inspirada em design systems: cada etapa é clara,
                  visual e sempre dark.
                </p>
              </div>

              <div className="space-y-px bg-white/10 rounded-xl overflow-hidden">
                {workflow.map((step, idx) => (
                  <div
                    key={step.tag}
                    className="bg-[#0a0a0a]/95 p-6 relative group hover:bg-[#0f0f0f] transition"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition" />
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400/50 to-purple-400/50 opacity-0 group-hover:opacity-100 transition blur-sm" />
                    <span className="text-xs uppercase tracking-widest text-white/40">
                      {step.tag}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-white/60">{step.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-6 backdrop-blur-sm relative hover:border-white/20 transition group">
              <div className="absolute top-0 right-0 w-24 h-px bg-gradient-to-l from-purple-500/50 to-transparent" />
              <div className="absolute top-0 right-0 w-24 h-px bg-gradient-to-l from-purple-400/30 to-transparent blur-sm" />

              {/* Glow de hover */}
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 text-sm text-white/60">
                <span>Preview tempo real</span>
                <ArrowRight size={16} />
              </div>

              <div className="space-y-6 pt-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    Deck
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">Design System Review</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    Último build
                  </p>
                  <p className="mt-2 text-lg text-white/80">há 12 segundos</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    Branch
                  </p>
                  <p className="mt-2 text-lg font-mono text-white/80">feat/slide-view</p>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#050505] p-4 font-mono text-xs text-white/60 space-y-1">
                  <p className="text-white/80">npm run deck:preview</p>
                  <p className="text-emerald-400">✔ pronto em 2.1s</p>
                  <p className="text-blue-400">Preview → app.slidemd.dev/preview</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section
          id="roadmap"
          className="mx-auto max-w-7xl px-6 py-24 relative"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-8 backdrop-blur-sm relative overflow-hidden hover:border-white/20 transition group">
            <div className="absolute top-0 left-0 w-48 h-px bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-transparent" />
            <div className="absolute top-0 left-0 w-48 h-px bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-transparent blur-sm" />
            <div className="absolute bottom-0 right-0 w-48 h-px bg-gradient-to-l from-purple-500/50 via-blue-500/50 to-transparent" />
            <div className="absolute bottom-0 right-0 w-48 h-px bg-gradient-to-l from-purple-400/30 via-blue-400/30 to-transparent blur-sm" />

            {/* Glow de hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity" />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Roadmap
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                  O que vem por aí.
                </h2>
              </div>
              <button
                className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/5"
                onClick={() => navigate("/app")}
              >
                Ver board
              </button>
            </div>

            <div className="grid gap-px bg-white/10 md:grid-cols-3 rounded-xl overflow-hidden">
              {[
                { label: "Disponível", value: "Presenter view 2.0", color: "from-green-500/50" },
                { label: "Em beta", value: "Export HTML estático", color: "from-blue-500/50" },
                { label: "Explorando", value: "Transições shadcn/ui", color: "from-purple-500/50" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#050505] p-6 relative group hover:bg-[#0a0a0a] transition"
                >
                  <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r ${item.color} to-transparent`} />
                  <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r ${item.color.replace('/50', '/30')} to-transparent blur-sm`} />
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="cta"
          className="mx-auto max-w-5xl px-6 py-32 text-center relative"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Spotlight para CTA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="space-y-8 relative">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Hora de apresentar
            </p>
            <h2 className="text-5xl font-bold leading-tight">
              Pronto para pilotar sua próxima demo?
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Inspiração Vercel, utilitários Tailwind e componentes shadcn/ui para
              entregar a melhor experiência dark-first.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-black hover:bg-white/90 hover:scale-105 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all"
                onClick={() => navigate("/app")}
              >
                Abrir o app
                <ArrowRight size={18} />
              </button>
              <button
                className="rounded-lg border border-white/20 px-8 py-4 text-base text-white/80 transition hover:border-white/40 hover:text-white hover:bg-white/5"
                onClick={() => navigate("/app")}
              >
                Explorar recursos
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0a] relative">
        {/* Linhas decorativas do footer - sutis */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* Grid de linhas no footer - muito sutil */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <div
              key={`footer-v-${i}`}
              className="absolute inset-y-0 w-px bg-gradient-to-b from-white/0 via-white/3 to-white/0"
              style={{ left: `${(i + 1) * 12.5}%` }}
            />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white text-xs">
                ▲
              </div>
              <span>© {new Date().getFullYear()} SlideMD</span>
            </div>
            <span>Feito com React, Tailwind e energia Vercel.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
