function get_detail() {
  let file = $('#file_upload')[0].files[0];
  if (file) {
    let sizeBig = $('#file_upload')[0].files[0].size / (1024 * 1024);
    let size = Math.floor(sizeBig);
    let extension = $('#file_upload')
      .val()
      .replace(/^.*\./, '');
    let total = parseInt($('#file_upload').get(0).files.length);

    $('#file_detail').html(
      '<strong> ' +
        total +
        ' arquivos, tamanho do maior arquivo: ' +
        size +
        'mb, tipo: ' +
        extension +
        '</strong>'
    );
    if (size > 5 || total > 5) {
      $('.buttonFormUpload')
        .addClass('btn-danger')
        .attr('disabled', 'disabled')
        .attr('value', 'Por favor verifique as imagens adicionadas');
      $('#file_upload').addClass('border border-danger');
    } else {
      $('.buttonFormUpload')
        .removeClass('btn-danger')
        .prop('disabled', false)
        .attr('value', 'Salvar');
      $('#file_upload').removeClass('border border-danger');
    }
  } else {
    $('#file_detail').html('');
    $('.buttonFormUpload')
      .removeClass('btn-danger')
      .prop('disabled', false)
      .attr('value', 'Salvar');
    $('#file_upload').removeClass('border border-danger');
  }
}
