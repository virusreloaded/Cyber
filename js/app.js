$('document').ready(function(){
	$('.burger').click(function(){
		if($(this).hasClass('close'))
		{
			$(this).removeClass('close');
			$('.menu').removeClass('fade');
		}
		else
		{
			$(this).addClass('close');
			$('.menu').addClass('fade');
		}
	})
})