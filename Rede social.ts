import {question} from 'readline-sync'
import sqlite3 from 'sqlite3'

enum TipoPersistencia {
    Array,
    BancoDeDados,
    Arquivo,
}

interface IRepositorioPerfis {
    incluir(perfil: Perfil): void
    consultar(id?: number, nome?: string, email?: string): Perfil | null
    getPerfis(): Perfil[]
}

interface IRepositorioPostagens {
    incluir(postagem: Postagem): void
    consultar(id?: number, texto?: string, hashtag?: string, perfil?: Perfil): Postagem[]
    getPostagens(): Postagem[]
}

class perfil {

    private id: number
    private nome: string
    private email: string
    private postagens: postagem[] = []

    constructor(id: number, nome: string, email: string) {
        this.id = id
        this.nome = nome
        this.email = email
    }

    get_id(): number {
        return this.id
    }

    get_nome(): string {
        return this.nome
    }

    get_email(): string {
        return this.email
    }

    adicionar_postagem(postagem: postagem):void {
        this.postagens.push(postagem)
    }
}

class postagem{
    private id: number
    private texto: string
    private curtidas: number
    private descurtidas: number
    private data: string
    private perfil: perfil

    constructor(id: number, texto: string, curtidas: number, descurtidas: number,data: string, perfil: perfil){
        this.id = id
        this.texto = texto
        this.curtidas = curtidas
        this.descurtidas = descurtidas
        this.data = data
        this.perfil = perfil
    }

    get_id(): number {
        return this.id
    }

    get_texto(): string {
        return this.texto
    }

    get_curtidas(): number {
        return this.curtidas
    }

    get_descurtidas(): number {
        return this.descurtidas
    }

    get_data(): string {
        return this.data
    }

    get_perfil(): perfil {
        return this.perfil
    }

    curtir(): void{
        this.curtidas ++
    }

    descutir(): void{
        this.descurtidas ++
    }
    
    eh_popular():boolean{
        if (this.curtidas > this.descurtidas * 1.5){
            return true
        }
        else {
            return false
        }
    }
}

class postagem_avancada extends postagem{
    private hashtags: string[]
    private visualizacoes_restantes: number

    constructor(id: number, texto: string, curtidas: number, descurtidas: number,data: string, perfil: perfil,hashtags: string[],visualizacoes_restantes: number){
        super(id,texto,curtidas,descurtidas,data,perfil)
        this.hashtags = hashtags
        this.visualizacoes_restantes = visualizacoes_restantes
    }

    get_visualizacoes_restantes():number{
        return this.visualizacoes_restantes
    }
    
    adicionar_hashtag(hashtag:string):void{
        this.hashtags.push(hashtag)
    }

    existe_hashtag(hashtag: string): boolean {
        for (let i = 0; i < this.hashtags.length; i++) {
            if (this.hashtags[i] === hashtag) {
                return true
            }
        }
        return false
    }
    
    decrementar_visualizacoes():void{
        this.visualizacoes_restantes--
    }
}   

class repositorio_de_perfis implements IRepositorioPerfis{
    private db: sqlite3.Database
    constructor() {
        this.db = new sqlite3.Database('database.db')
        this.criarTabela()
    }

    private criarTabela(): void {
        const query = `
            CREATE TABLE IF NOT EXISTS perfis (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL,
                email TEXT NOT NULL
            );
        `;
        this.db.run(query);
    }

    incluir(perfil:perfil):void{
        const query = 'INSERT INTO perfis (id, nome, email) VALUES (?, ?, ?)';
        this.db.run(query, [perfil.get_id(), perfil.get_nome(), perfil.get_email()]);
    }
    

    consultar(id?: number, nome?: string, email?: string): perfil | null {
         let whereClause = '';
            let values: (number | string)[] = [];

            if (id !== undefined) {
                whereClause += ' WHERE id = ?';
                values.push(id);
            } else if (nome) {
                whereClause += ' WHERE nome = ?';
                values.push(nome);
            } else if (email) {
                whereClause += ' WHERE email = ?';
                values.push(email);
            }

            const query = `SELECT * FROM perfis${whereClause}`;
            return this.db.get(query, values, (err, row) => {
                if (err) {
                    throw err;
                }
                return row ? new Perfil(row.id, row.nome, row.email) : null;
            });
        }

    

    get_perfis():perfil[]{
         const query = 'SELECT * FROM perfis';
        return this.db.all(query, [], (err, rows) => {
            if (err) {
                throw err;
            }
            return rows.map(row => new Perfil(row.id, row.nome, row.email));
        });
    }

}


class repositorio_de_postagens implements IRepositorioPostagens{
    postagens: postagem[] = []


    incluir(postagem_nova:postagem):void {
        this.postagens.push(postagem_nova)
        const perfil = postagem_nova.get_perfil()
        perfil.adicionar_postagem(postagem_nova)
    }

    consultar(id?: number, texto?: string, hashtag?: string, perfil?: perfil): postagem[] {
        const postagensEncontradas: postagem[] = []
    
        if (hashtag && perfil) {
          for (const postagem of this.postagens) {
            if (postagem instanceof postagem_avancada && postagem.get_perfil() === perfil && postagem.existe_hashtag(hashtag)) {
              postagensEncontradas.push(postagem)
            }
          }
          return postagensEncontradas
        }
    
        for (const postagem of this.postagens) {
          if ((!id || postagem.get_id() === id) &&
            (!texto || postagem.get_texto() === texto) &&
            (!perfil || postagem.get_perfil() === perfil)
          ) {
            postagensEncontradas.push(postagem)
          }
        }
    
        return postagensEncontradas
    }

    get_postagens():postagem[]{
        return this.postagens
    }
}

class RedeSocial{
    private armazenamento_postagens:IRepositorioPostagens
    private armazenamento_perfis: IRepositorioPerfis

    constructor(){
        this.armazenamento_postagens = new repositorio_de_postagens()
        this.armazenamento_perfis= new repositorio_de_perfis()
    }
    
    
    perfil_nao_existe(perfil: perfil): boolean {
        let perfis = this.armazenamento_perfis.get_perfis()
        for (const perf of perfis) {
            if (perf.get_id() === perfil.get_id() || perf.get_nome() === perfil.get_nome() || perf.get_email() === perfil.get_email()) {
                return false
            }
        }
        return true
    }
    
    
    postagemNaoExiste(postagem: postagem): boolean {
        const postagens = this.armazenamento_postagens.get_postagens()
        for (const post of postagens) {
            if (post.get_id() === postagem.get_id()) {
                return false
      }
    }
        return true
    }




    preenchimento_valido(perfil: perfil): boolean {
        if (perfil.get_id() && perfil.get_nome().trim() !== '' && perfil.get_email().trim() !== '') {
            return true
    }   else {
            return false
    }
    }

    
    
    incluir_perfil(perfil:perfil):void{
        if (this.perfil_nao_existe(perfil) && this.preenchimento_valido(perfil)){
            this.armazenamento_perfis.incluir(perfil)
            console.log('Cadastro feito com sucesso')
        }
        else{
            console.log('ERROR 404 ')
        }
    }

    consultar_perfil(id?:number, nome?:string, email?:string):perfil | null{
        return this.armazenamento_perfis.consultar(id,nome,email)
    }

    incluirPostagem(postagem: postagem): void {
    if (postagem.get_id() !== undefined && postagem.get_texto().trim() !== '' && postagem.get_perfil()) {
      if (this.postagemNaoExiste(postagem)) {
        this.armazenamento_postagens.incluir(postagem)
        console.log('Postagem incluída com sucesso.')
      } else {
        console.log('Erro: Já existe uma postagem com o mesmo ID.')
      }
    } 
    else {
      console.log('Erro: Não foi possível incluir a postagem, atributos incompletos.')
    }
  }

    consultar_postagens(id?: number, texto?: string, hashtag?: string, perfil?: perfil):postagem[]{
        return this.armazenamento_postagens.consultar(id,texto,hashtag,perfil)
    }

    curtir_postagem(id_postagem:number):void{
        const postagens = this.armazenamento_postagens.get_postagens()
        for (let post of postagens){
            if(id_postagem === post.get_id()){
                post.curtir()
            }
            
        }
    }

    descurtir_postagem(id_postagem:number):void{
        const postagens = this.armazenamento_postagens.get_postagens()
        for (let post of postagens){
            if(id_postagem === post.get_id()){
                post.descutir()
            }
            
        }
    }

    decrementar_visualizacoes(postagem: postagem_avancada): void {
        const restante_de_visualizacoes = postagem.get_visualizacoes_restantes()
        if (restante_de_visualizacoes > 0) {
            postagem.decrementar_visualizacoes()
        } else {
            console.log('Erro: Contador de visualizações já é zero.')
        }
    }

    exibirPostagensPorPerfil(id: number): postagem[] {
        const perfilConsultado = this.armazenamento_perfis.consultar(id)

        if (perfilConsultado) {
            const postagensDoPerfil: postagem[] = this.armazenamento_postagens.consultar(undefined, undefined, undefined, perfilConsultado)

            postagensDoPerfil.forEach(postagem => {
                if (postagem instanceof postagem_avancada) {
                    this.decrementar_visualizacoes(postagem)
                }
            })

            const postagensExibiveis = postagensDoPerfil.filter(postagem => {
                if (postagem instanceof postagem_avancada) {
                    return postagem.get_visualizacoes_restantes() > 0
                }
                return true
            })

            return postagensExibiveis
        } else {
            console.log('Perfil não encontrado.')
            return []
        }
    }

    exibirPostagensPorHashtag(hashtag: string): postagem_avancada[] {
        const postagensPorHashtag: postagem_avancada[] = this.armazenamento_postagens.consultar(undefined, undefined, hashtag, undefined).filter(postagem => postagem instanceof postagem_avancada) as postagem_avancada[]

        postagensPorHashtag.forEach(postagem => {
            if (postagem instanceof postagem_avancada) {
                this.decrementar_visualizacoes(postagem)
            }
        })

        const postagensExibiveis: postagem_avancada[] = postagensPorHashtag.filter(postagem => {
            if (postagem instanceof postagem_avancada) {
                return postagem.get_visualizacoes_restantes() > 0
            }
            return false
        })

        return postagensExibiveis
    }

}


class app{
    rede_social: RedeSocial

    constructor(rede_social:rede_social){
        const tipoPersistencia = this.escolherTipoPersistencia();
        this.inicializarRedeSocial(tipoPersistencia);
    }

    private escolherTipoPersistencia(): TipoPersistencia {
        const opcoesPersistencia = [
            'Array',
            'Banco de Dados',
            'Arquivo',
        ];

      console.log('Escolha o mecanismo de persistência:');
        opcoesPersistencia.forEach((opcao, index) => {
            console.log(`${index + 1}. ${opcao}`);
        });

        const escolha = parseInt(question('Digite o número correspondente: '));

        switch (escolha) {
            case 1:
                return TipoPersistencia.Array;
            case 2:
                return TipoPersistencia.BancoDeDados;
            case 3:
                return TipoPersistencia.Arquivo;
            default:
                throw new Error('Escolha inválida');
        }
    }

    private inicializarRedeSocial(tipoPersistencia: TipoPersistencia): void {
        switch (tipoPersistencia) {
            case TipoPersistencia.Array:
                this.redeSocial = new RedeSocial(
                    new RepositorioDePerfisArray(),
                    new RepositorioDePostagensArray()
                );
                break;
            case TipoPersistencia.BancoDeDados:
                this.redeSocial = new RedeSocial(
                    new RepositorioDePerfisBancoDeDados(),
                    new RepositorioDePostagensArray() // ou crie uma implementação específica para o banco de dados
                );
                break;
            case TipoPersistencia.Arquivo:
                // Adicione implementação para persistência em arquivo se necessário
                break;
            default:
                throw new Error('Tipo de persistência não reconhecido');
        }
    }

    criar_perfil(): perfil{
        const id = parseInt(question("Digite o ID do perfil: "))
        const nome = question("Digite o nome do perfil: ")
        const email = question("Digite o e-mail do perfil: ")
        const perfil_novo = new perfil(id,nome,email)
        return perfil_novo

    }

    criar_postagem():postagem{
        const id_postagem = parseInt(question('Digite o id da postage.: '))
        const texto = question("Digite o texto da postagem: ")
        const curtidas = parseInt(question('Digite a quantidade de curtidas: '))
        const descurtidas = parseInt(question("Digite a quantidade de descurtidas: "))
        const data = question("Digite a data do post: ")
        const perfil = this.criar_perfil()
        const postagem_nova = new postagem(id_postagem,texto,curtidas,descurtidas,data,perfil)
        return postagem_nova
    }

    exibirMenu() {
        let opcao = -1
    
        while (opcao !== 0) {
          console.log("\n=== Menu da Rede Social ===")
          console.log("1. Incluir perfil")
          console.log("2. Consultar Perfil")
          console.log("3. Incluir postagem")
          console.log("4. Consultar Postagens")
          console.log("5. Curtir Postagem")
          console.log("6. Descurtir Postagem")
          console.log("0. Sair")
    
          opcao = parseInt(question("Escolha uma opcao: "))
    
          switch (opcao) {
            case 1:
                this.rede_social.incluir_perfil(this.criar_perfil())
                break
            case 2:
                let id = parseInt(question("Digite o ID do perfil: "))
                let nome = question("Digite o nome do perfil: ")
                let email = question("Digite o e-mail do perfil: ")
                break
            case 3:
                this.rede_social.incluirPostagem(this.criar_postagem())
                break
            case 4:
              //this.consultarPostagens()
              break
            case 5:
                let id_postagem = parseInt(question("Digite o id da postagem a ser curtida: "))
                this.rede_social.curtir_postagem(id_postagem)
                break
            case 6:
                let id_postagem1 = parseInt(question("Digite o id da postagem a ser curtida: "))    
                this.rede_social.descurtir_postagem(id_postagem1)
                break
            case 0:
              console.log("Saindo da aplicação.")
              break
            default:
              console.log("Opção inválida. Por favor, escolha uma opção válida.")
          }
        }
      }
}

const meuApp = new app()


try {
    meuApp.exibirMenu();
} catch (error) {
    console.error(`Ocorreu um erro: ${error.message}`);
} finally {
    console.log("Saindo da aplicação.");
}