/**
 * Impressão isolada da Certidão — abre janela só com o documento,
 * evitando interferência do layout da SPA e corte de cabeçalho/rodapé.
 */
export function printCertidaoDocument(sourceRoot: ParentNode): void {
  const documentEl = sourceRoot.querySelector('.cert-document');
  if (!documentEl) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Certidão VEBOOK — Impressão</title>
${styles}
</head>
<body class="vebook-print-certidao cert-print-window">
${documentEl.outerHTML}
<script>
  function doPrint() {
    window.focus();
    window.print();
  }
  window.addEventListener('load', function () {
    var imgs = document.querySelectorAll('img');
    var pending = imgs.length;
    if (pending === 0) {
      doPrint();
      return;
    }
    imgs.forEach(function (img) {
      function done() {
        pending -= 1;
        if (pending === 0) doPrint();
      }
      if (img.complete) done();
      else {
        img.addEventListener('load', done);
        img.addEventListener('error', done);
      }
    });
  });
  window.addEventListener('afterprint', function () {
    window.close();
  });
</script>
</body>
</html>`);
  printWindow.document.close();
}
