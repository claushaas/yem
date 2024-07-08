import {type TEmailTemplate} from '../../types/email-template.type.js';

export const schoolWelcomeEmailTemplate = (firstName: string, to: string): TEmailTemplate => ({
	to,
	subject: `Parabéns, ${firstName}! Sua jornada começa agora!!`,
	html: `
  <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		@media (max-width:620px) {
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style>
</head>

<body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 219px;"><a href="https://yogaemmovimento.com" target="_blank" style="outline:none" tabindex="-1"><img src="https://img.amo.yoga/logo_yem.png" style="display: block; height: auto; border: 0; width: 100%;" width="219" alt="Yoga em Movimento" title="Yoga em Movimento" height="auto"></a></div>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:30px;">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span>&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="heading_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:30px;text-align:center;width:100%;">
																<h1 style="margin: 0; color: #7747FF; direction: ltr; font-family: Arial, Helvetica, sans-serif; font-size: 38px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 45.6px;"><span class="tinyMce-placeholder">Parabéns ${firstName}!</span></h1>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">Sua matrícula foi confirmada.</p>
																	<p style="margin: 0; margin-bottom: 16px;">Eu e toda a equipe do Yoga em Movimento faz questão de lhe dar as boas vindas à nossa Escola de Yoga Online.</p>
																	<p style="margin: 0; margin-bottom: 16px;">Para acessar a área dos alunos, basta entrar em <a href="https://escola.yogaemmovimento.com" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">escola.yogaemmovimento.com</a> e clicar no link "Entrar" na barra superior para fazer o login com o email e senha que você utilizou para fazer o seu cadastro.</p>
																	<p style="margin: 0; margin-bottom: 16px;">Caso tenha esquecido sua senha, basta clicar em "Esqueci Minha Senha" abaixo do formulário de login e seguir as orientações para criar uma nova senha de acesso.</p>
																	<p style="margin: 0; margin-bottom: 16px;">Observação: se o link "Entrar" não aparecer, significa que seu login já foi feito. Então basta clicar no link "Área dos Alunos" para acessar as aulas.</p>
																	<p style="margin: 0; margin-bottom: 16px;">Uma vez na área de alunos, acreditamos que você não terá qualquer dificuldade para selecionar suas aulas.</p>
																	<p style="margin: 0; margin-bottom: 16px;">Atenção: todas as nossas aulas são voltadas para pessoas que estejam em bom estado de saúde. Se você tiver dúvidas se está apto ou não a fazer as práticas, imprima o arquivo em anexo e peça para o seu médico avaliar se há algum tipo de restrição. Se precisar de orientações adicionais, entre em contato conosco respondendo este e-mail.</p>
																	<p style="margin: 0; margin-bottom: 16px;">E se precisar de qualquer ajuda nesses primeiros passos, fique à vontade para nos chamar em qualquer dos nossos canais de suporte:</p>
																	<p style="margin: 0; margin-bottom: 16px;">Telegram: <a href="http://t.me/yogaemmovimento_bot" style="text-decoration: underline; color: #7747FF;">http://t.me/yogaemmovimento_bot</a></p>
																	<p style="margin: 0; margin-bottom: 16px;">Messenger: <a href="http://m.me/yogaemmovimento" style="text-decoration: underline; color: #7747FF;">http://m.me/yogaemmovimento</a></p>
																	<p style="margin: 0; margin-bottom: 16px;">WhatsApp <a href="https://wa.me/551149359150" rel="noopener noreferrer" target="_blank" style="text-decoration: underline; color: #7747FF;">+55 11 4935-9150</a></p>
																	<p style="margin: 0; margin-bottom: 16px;">Segue também o contrato que rege a prestação deste serviço:<a href="https://d1k8tin4cdb6jb.cloudfront.net/Contrato_Escola_Online_01-12-20.pdf" style="text-decoration: underline; color: #7747FF;"> https://d1k8tin4cdb6jb.cloudfront.net/Contrato_Escola_Online_01-12-20.pdf</a></p>
																	<p style="margin: 0; margin-bottom: 16px;">Um abraço, e mais uma vez parabéns por esse importante passo.</p>
																	<p style="margin: 0;">Claus Haas - Diretor do Yoga em Movimento</p>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
  `,
	text: `
  Parabéns ${firstName}! Sua matrícula foi confirmada.

  Eu e toda a equipe do Yoga em Movimento faz questão de lhe dar as boas vindas à nossa Escola de Yoga Online.
  
  Para acessar a área dos alunos, basta entrar em escola.yogaemmovimento.com e clicar no link "Entrar" na barra superior para fazer o login com o email e senha que você utilizou para fazer o seu cadastro.
  
  Caso tenha esquecido sua senha, basta clicar em "Esqueci Minha Senha" abaixo do formulário de login e seguir as orientações para criar uma nova senha de acesso.
  
  Observação: se o link "Entrar" não aparecer, significa que seu login já foi feito. Então basta clicar no link "Área dos Alunos" para acessar as aulas.
  
  Uma vez na área de alunos, acreditamos que você não terá qualquer dificuldade para selecionar suas aulas.
  
  Atenção: todas as nossas aulas são voltadas para pessoas que estejam em bom estado de saúde. Se você tiver dúvidas se está apto ou não a fazer as práticas, imprima o arquivo em anexo e peça para o seu médico avaliar se há algum tipo de restrição. Se precisar de orientações adicionais, entre em contato conosco respondendo este e-mail.
  
  E se precisar de qualquer ajuda nesses primeiros passos, fique à vontade para nos chamar em qualquer dos nossos canais de suporte:
  
  Telegram: http://t.me/yogaemmovimento_bot
  
  Messenger: http://m.me/yogaemmovimento
  
  WhatsApp +55 11 4935-9150
  
  Segue também o contrato que rege a prestação deste serviço: https://d1k8tin4cdb6jb.cloudfront.net/Contrato_Escola_Online_01-12-20.pdf
  
  Um abraço, e mais uma vez parabéns por esse importante passo.
  
  Claus Haas - Diretor do Yoga em Movimento
  
  `,
});
