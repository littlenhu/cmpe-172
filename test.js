#!/usr/bin/env node

        // declaring repl to for display/interaction
        var repl = require ('repl');
        // used to request url from coinbase site
        var request = require ('request');
        // perform operations on array
        var underscore=require('underscore');
        // used to create csv file 
        var csv=require('fast-csv');
        var fs=require('fs');
        var market={
               rates:{},
        };

        // declaring order array
        var order_array=[];

        // requesting api from coinbase
        request('https://coinbase.com/api/v1/currencies/exchange_rates',function(error,response, body)
        {
        // checking for errors 
            if(error)
            {
                console.log("Request Function was not successfully used.");
            }

            // checking status code
             else if(response.statusCode !== 200)
            {
                console.log('Invalid error code');
            }
            //storing the parse data into market.rates
            market.rates=JSON.parse(body);            

        });

        // displaying menu
        console.log('Welcome to Bitcoin Exchange Rate!\n');
         // creating custom repl
         repl.start({
                prompt:'coinbase>'
                ,eval:function(cmd,context,filename,callback)
                {
                        // used to display time/date
                        var date = new Date().toGMTString();
                        //using toupper for cmd so Buy or buy works 
                        var str=cmd.toUpperCase();
                        // used to extract the message by splitting when encounter \n (space)
                        var message = str.replace('\n','').split(' ');
                        // used to concat later 
                        var BTC_To = '_to_btc';
                        // used to concat later 
                        var To_BTC = 'btc_to_';
                         // join the input to input_to_btc format
                        var new_BTC_To;
                        // join the input to btc_to_input format;
                        var newTo_BTC;
                        // used to calculate the value
                        var value;

                        // if user enter BUY
                        if(message[0]=='BUY')
                        {
                                
                            // requesting api from coinbase
                            request('https://coinbase.com/api/v1/currencies/exchange_rates',function(error,response, body)
                            {
                                    // checking for errors 
                                    if(error)
                                    {
                                        console.log("Request Function was not successfully used.");
                                    }

                                   // checking status code
                                   else if(response.statusCode !== 200)
                                   {
                                    console.log('Invalid error code');
                                   }
                                   //storing the parse data into market.rates
                                    market.rates=JSON.parse(body);            

                            });

                                // used to check JSON file
                                new_BTC_To=message[2].toLowerCase().concat(BTC_To);
                                newTo_BTC=To_BTC.concat(message[2].toLowerCase());
                                // used to get values 
                                value=message[1]*market.rates[new_BTC_To];
                                
                                //checking for valid amount: non integers and negative 
                                if(message[1]!=parseFloat(message[1]) || message[1]<0)
                                {
                                        console.log("No amount specified.\n");
                                        return
                                }
                                //used to check for valid currency
                                else if(market.rates[new_BTC_To]==undefined)
                                {
                                        console.log('No known exchange rate for ' + message[2] + ' Order failed.');
                                        return
                                }

                                // used to display message to buy bitcoin only 
                                else if(message[2]=='BTC')
                                {
                                        order_array.push(date+':'+str.replace('\n','')+':UNFILLED');
                                        console.log('Order to ' + str +'queued');
                                        return
                                }

                                // storing valid inputs into an array with date 
                                // order_array.push(date+':'+str.replace('\n','')+':UNFILLED');
                                order_array.push(date+':'+str.replace('\n',''));
                                console.log('Order to ' + str.replace('\n','') + ' worth of BTC queued @'+ market.rates[newTo_BTC],'BTC/'+message[2]+' (' + value +' BTC)');
                                
                         }  

                        // if users enter SEll
                        else if(message[0]=='SELL')
                        {
                                 request('https://coinbase.com/api/v1/currencies/exchange_rates ',function(error,response, body)
                            {
                                    // checking for errors 
                                    if(error)
                                    {
                                            console.log("Request Function was not successfully used.");
                                    }

                                   // checking status code
                                   else if(response.statusCode !== 200)
                                   {
                                    console.log('Invalid error code');
                                   }
                                   // storing the parse data into market.rates
                                    market.rates=JSON.parse(body);            

                            });

                                new_BTC_To=message[2].toLowerCase().concat(BTC_To);
                                newTo_BTC=To_BTC.concat(message[2].toLowerCase());
                                value=message[1]*market.rates[new_BTC_To];

                                //checking for valid amount
                                if(message[1]!=parseFloat(message[1])|| message[1]<0)
                                {
                                        console.log("No amount specified.\n");
                                        return
                                }

                                //used to check for valid currency
                                else if(market.rates[new_BTC_To]==undefined)
                                {
                                        console.log('No known exchange rate for ' + message[2] + ' Order failed.');
                                        return
                                }

                                // used to display message to buy bitcoin only 
                                else if(message[2]=='BTC')
                                {
                                        order_array.push(date+':'+str.replace('\n','')+':UNFILLED');
                                        console.log('Order to ' + str.replace('\n','') +' queued');
                                        return
                                }

                                order_array.push(date+':'+str.replace('\n','')+':UNFILLED');
                                console.log('Order to ' + str.replace('\n','') + ' worth of BTC queued @'+ market.rates[newTo_BTC],'BTC/'+message[2]+' (' + value +' BTC)');
                        }
                
                        // if users enter orders
                        else if(message[0]=='ORDERS')
                        {
                            
                            
                             var csvStream = csv.createWriteStream({headers:false}),
                                 writableStream = fs.createWriteStream("my.csv");

                                 writableStream.on("finish", function()
                                 {
                                     callback(null);
                                 });

                            // outputting onto console 
                            console.log('=== CURRENT ORDERS ===');
                            underscore.each(order_array,function(array)
                            {
                                console.log(array);
                                csvStream.pipe(writableStream);
                                csvStream.write(array);
                                csvStream.end();

                            });

                            








                            // var csvStream = csv.createWriteStream({headers:true}),
                            //     writableStream = fs.createWriteStream("my.csv");

                            //     writableStream.on("finish", function()
                            //     {
                            //         console.log("DONE!");
                            //     });

                            //     csvStream.pipe(writableStream);
                            //     csvStream.write(array);
                            //     csvStream.end();
                        }

                        // if invalid syntax is enter ie buys/sells
                        else
                        {
                            console.log('Invalid syntax enter. Please enter correct syntax');
                            return
                        }
































                }
                        

         });

