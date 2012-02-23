var map, geocoder, marker,
	ey, my, mouseDown = false;
var o = {
	init: function(){
		this.map.init();
        this.twitter.get();
		this.twitter.click();
		this.scroll.init();
	},
	twitter: {
		get: function(){
           var arr = new Array;
            $.getJSON('https://api.twitter.com/1/statuses/public_timeline.json?count=100&include_entities=true'+'&callback=?',function(data){ 
                $.each(data, function(i) {
                        var img = this.user.profile_image_url,
                        screen_name = this.user.screen_name,
                        description = this.user.description,
                        url = this.user.url,
                        followers_count = this.user.followers_count,
                        friends_count = this.user.friends_count
                        ;
                    geocoder.geocode({ address: this.user.location }, function(response, status){
                        if (status == google.maps.GeocoderStatus.OK) {
                            var x = response[0].geometry.location.lat(),
                                y = response[0].geometry.location.lng();
                            marker = new google.maps.Marker({
                                icon: img,
                                map: map,
                                title: screen_name,
                                position: new google.maps.LatLng(x, y)
                            });
                            google.maps.event.addListener(marker, 'click', function(){
                                o.twitter.show(this.position);                      
                                o.twitter.open(this.title);

                            });

                        }
                    });

                    });
            });
		},
        show:function(position){
                 var arr = new Array;
           var url ='https://api.twitter.com/1/trends/available.json?lat='+position.lat()+'&long='+position.lng();     
          $.ajax({
            url: url,
            dataType: "jsonp",
            success: function(e){
              var woeid = e[0].woeid;
              var location = e[0].name;
              var turl = 'https://api.twitter.com/1/trends/'+woeid+'.json';

              $.ajax({
                url: turl,
                dataType: "jsonp",
                success: function(e){
                  var trends = e[0].trends;
                  var items = '';
                  $('.twitter').find('.inside').empty();
                  arr.push('<center><p> Who is tweeting right now?</p></center>');
                  $.each(trends, function(i,result){
                            arr.push('<div class="item">');
                            arr.push('<div class="entry">');
                            arr.push('<div class="description">');
                            arr.push('<a href="'+result.url+'">'+result.name+'</a></p>');
                            arr.push('</div>');
                            arr.push('</div>');
                            arr.push('</div>');
                            var html = arr.join(' ');
                            arr=[];
                            $('.twitter').find('.inside').append(html);

                  });
                                
                }
              });

            }
          });
             },
	    click: function(){
			$('.twitter').find('.open').live('click', function(){
				var t = $(this), rel = t.attr('rel');
				o.twitter.open(rel);
			});
		},
		open: function(user){
			var posts = $('.posts'), arr = new Array;
			$.getJSON('http://twitter.com/status/user_timeline/'+user+'.json?count=5&callback=?', function(data) {
				$.each(data, function(i, post){
					arr.push('<div class="post">');
					arr.push(post.text);
					arr.push('</div>');
				});
				var html = arr.join('');
				posts.html(html).fadeIn();
			});
		},
	},
	map: {
		size: function(){
			var w = $(window).width(),
				h = $(window).height();
			return { width: w, height: h }
		},
		data: {
			zoom: 3,
			center: new google.maps.LatLng(52, 23),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		init: function(){
			var size = o.map.size();
			$('#map').css({ width: size.width, height: size.height });
			map = new google.maps.Map(document.getElementById('map'), o.map.data),
			geocoder = new google.maps.Geocoder();
			google.maps.event.addListener(map, 'dragstart', function(event){
				$('.posts').hide();
                $('.twitter').find('.inside').empty();
			});

		}
	},
	scroll: {
		mouse: function(e){
			var y = e.pageY; 
			return y;
		},
		check: function(y){
			var all = $('.twitter').height(),
				inside = $('.twitter').find('.inside').height();
			if (y < (all - inside)) {
				y = all - inside;
			} else if (y > 0) {
				y = 0;
			}
			return y;
		},
		update: function(e){
			var y = o.scroll.mouse(e),
				movey = y-my,
				top = ey+movey;
				check = o.scroll.check(top);
			$('.twitter').find('.inside').css({ top: check+'px' });
		},
		init: function(){
			$('.twitter').find('.inside').bind({
				mousedown: function(e){
					e.preventDefault();
					mouseDown = true;
					var mouse = o.scroll.mouse(e);
						my = mouse;
					var element = $(this).position();
						ey = element.top;
					o.scroll.update(e);
				},
				mousemove: function(e){
					if (mouseDown)
						o.scroll.update(e);
					return false;
				},
				mouseup: function(){
					if (mouseDown)
						mouseDown = false;
					return false;
				},
				mouseleave: function(){
					if (mouseDown)
						mouseDown = false;
					return false;
				}
			});
		}
	}
}

$(function(){ o.init(); });
