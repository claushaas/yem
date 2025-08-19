import type { TEmailTemplate } from '../../types/email-template.type.js';

export const formationWelcomeEmailTemplate = (
	firstName: string,
	to: string,
): TEmailTemplate => ({
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
																		<p style="margin: 0; margin-bottom: 16px;">Olá querido Yogin, seja muito bem vindo ao curso de Formação do YEM!</p>
																		<p style="margin: 0; margin-bottom: 16px;">É com muita alegria e satisfação que recebemos você em nossa casa virtual para passarmos bons momentos, estudar muito, praticar yoga e aprender uns com os outros.</p>
																		<p style="margin: 0; margin-bottom: 16px;">Recomendamos que você comece assistindo este vídeo que está em nosso YouTube, onde a Prof. Milena explica como dar os seus primeiros passos em nosso curso de Formação em Yoga:</p>
																		<p style="margin: 0; margin-bottom: 16px;"><a href="https://youtu.be/eY6ULiGTWUM" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://youtu.be/eY6ULiGTWUM</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">Na aula inaugural explicamos todo o funcionamento do curso e as dúvidas dos alunos que estavam presente. Assista para você conhecer os professores e equipe técnica e fazer um tour pelo site e se familiarizar.</p>
																		<p style="margin: 0; margin-bottom: 16px;">Você pode acessar a aula inaugural diretamente neste link: <a href="https://yogaemmovimento.com/courses/formacao-em-yoga-introducao/comecando-o-curso/aula-inaugural" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://yogaemmovimento.com/courses/formacao-em-yoga-introducao/comecando-o-curso/aula-inaugural</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">Além disso teremos um canal de avisos no Telegram, e um grupo de integração. Seguem os link abaixo:</p>
																		<p style="margin: 0; margin-bottom: 16px;">Canal para Recados: <a href="https://t.me/joinchat/_2UwTcWJ5to3MTAx" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://t.me/joinchat/_2UwTcWJ5to3MTAx</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">Grupo para interação entre os alunos: <a href="https://t.me/joinchat/gxazJsQTmwI5YzYx" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://t.me/joinchat/gxazJsQTmwI5YzYx</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">Para suporte técnico, dúvidas sobre o site, qualquer problema de pagamentos, e também para conversar com os professores sobre as dúvidas do curso, você pode usar qualquer dos canais abaixo, selecionando a opção desejada:</p>
																		<p style="margin: 0; margin-bottom: 16px;">Telegram <a href="https://t.me/yogaemmovimento_bot" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://t.me/yogaemmovimento_bot</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">Messenger <a href="https://m.me/yogaemmovimento" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://m.me/yogaemmovimento</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">WhatsApp +55 11 4935-9150 (<a href="https://wa.me/551149359150" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://wa.me/551149359150</a>)</p>
																		<p style="margin: 0; margin-bottom: 16px;">Os professores estarão online sempre durante os dias da semana, segunda a sexta-feira (exceto feriados), das 10h às 19h, então para dúvidas da parte pedagógica, procure enviar suas mensagens nestas janelas de horários para podermos lhe atender mais facilmente.</p>
																		<p style="margin: 0; margin-bottom: 16px;">Nos links abaixo você encontrará o Contrato deste curso e o manual do aluno, documentos que estabelecem todo o funcionamento e prazos do nosso curso, por favor leia-os atentamente e em caso de dúvidas, não hesite em nos chamar:</p>
																		<p style="margin: 0; margin-bottom: 16px;">Contrato: <a href="https://d1k8tin4cdb6jb.cloudfront.net/Contrato_Formacao-em-Yoga.pdf" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://d1k8tin4cdb6jb.cloudfront.net/Contrato_Formacao-em-Yoga.pdf</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">Manual do Aluno: <a href="https://img.amo.yoga/MANUAL_DO_ALUNO.pdf" target="_blank" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://img.amo.yoga/MANUAL_DO_ALUNO.pdf</a></p>
																		<p style="margin: 0; margin-bottom: 16px;">Estamos muito felizes em iniciar esta nova turma e que seja um ótimo curso para todos nós.</p>
																		<p style="margin: 0;">Equipe Yoga em Movimento</p>
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
	subject: `Parabéns, ${firstName}! Sua jornada começa agora!!`,
	text: `
Olá querido Yogin, seja muito bem vindo ao curso de Formação do YEM!

É com muita alegria e satisfação que recebemos você em nossa casa virtual para passarmos bons momentos, estudar muito, praticar yoga e aprender uns com os outros.

Recomendamos que você comece assistindo este vídeo que está em nosso YouTube, onde a Prof. Milena explica como dar os seus primeiros passos em nosso curso de Formação em Yoga:

https://youtu.be/eY6ULiGTWUM

Na aula inaugural explicamos todo o funcionamento do curso e as dúvidas dos alunos que estavam presente. Assista para você conhecer os professores e equipe técnica e fazer um tour pelo site e se familiarizar.

Você pode acessar a aula inaugural diretamente neste link: https://yogaemmovimento.com/courses/formacao-em-yoga-introducao/comecando-o-curso/aula-inaugural

Além disso teremos um canal de avisos no Telegram, e um grupo de integração. Seguem os link abaixo:

Canal para Recados: https://t.me/joinchat/_2UwTcWJ5to3MTAx

Grupo para interação entre os alunos: https://t.me/joinchat/gxazJsQTmwI5YzYx

Para suporte técnico, dúvidas sobre o site, qualquer problema de pagamentos, e também para conversar com os professores sobre as dúvidas do curso, você pode usar qualquer dos canais abaixo, selecionando a opção desejada:

Telegram https://t.me/yogaemmovimento_bot

Messenger https://m.me/yogaemmovimento

WhatsApp +55 11 4935-9150 (https://wa.me/551149359150)

Os professores estarão online sempre durante os dias da semana, segunda a sexta-feira (exceto feriados), das 10h às 19h, então para dúvidas da parte pedagógica, procure enviar suas mensagens nestas janelas de horários para podermos lhe atender mais facilmente.

Nos links abaixo você  encontrará o Contrato deste curso e o manual do aluno, documentos que estabelecem todo o funcionamento e prazos do nosso curso, por favor leia-os atentamente e em caso de dúvidas, não hesite em nos chamar:

Contrato: https://d1k8tin4cdb6jb.cloudfront.net/Contrato_Formacao-em-Yoga.pdf

Manual do Aluno: https://img.amo.yoga/MANUAL_DO_ALUNO.pdf

Estamos muito felizes em iniciar esta nova turma e que seja um ótimo curso para todos nós.

Equipe Yoga em Movimento
  `,
	to,
});
